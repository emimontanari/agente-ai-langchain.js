import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BookingsService } from '../../bookings/bookings.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';

@Injectable()
export class ScheduleTool {
  constructor(
    private readonly bookings: BookingsService,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
  ) { }

  getTool() {
    return new DynamicStructuredTool({
      name: 'schedule_appointment',
      description:
        'Prepara una reserva de turno guardándola en el contexto para confirmación. NO crea el turno directamente. Requiere conversationId, barberId, serviceId y datetime en formato ISO.',
      schema: z.object({
        conversationId: z.string().uuid(),
        barberId: z.string().uuid(),
        barberName: z.string(),
        serviceId: z.string().uuid(),
        serviceName: z.string(),
        dateTimeIso: z.string().describe('Fecha/hora ISO 8601'),
        priceCents: z.number().int().positive(),
      }),
      func: async ({
        conversationId,
        barberId,
        barberName,
        serviceId,
        serviceName,
        dateTimeIso,
        priceCents,
      }) => {
        try {
          // 1. Recuperar conversación
          const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId },
          });

          if (!conversation) {
            return {
              ok: false,
              message: 'No se encontró la conversación.',
            };
          }

          // 2. Validar disponibilidad antes de guardar
          const isAvailable = await this.bookings.checkAvailability(
            barberId,
            new Date(dateTimeIso),
          );

          if (!isAvailable) {
            return {
              ok: false,
              message:
                'Ese horario no está disponible. Por favor elige otro horario.',
            };
          }

          // 3. Guardar en contexto para confirmación
          conversation.context = conversation.context || {};
          conversation.context.pendingBooking = {
            serviceId,
            serviceName,
            barberId,
            barberName,
            datetime: dateTimeIso,
            priceCents,
            confirmed: false,
          };

          await this.conversationRepo.save(conversation);

          // 4. Retornar mensaje para que el agente solicite confirmación
          const formattedDate = new Date(dateTimeIso).toLocaleString('es-AR', {
            dateStyle: 'long',
            timeStyle: 'short',
          });

          return {
            ok: true,
            pendingConfirmation: true,
            message: `Perfecto! Aquí está el resumen de tu turno:\n\n📋 Servicio: ${serviceName}\n👤 Peluquero: ${barberName}\n📅 Fecha y hora: ${formattedDate}\n💰 Precio: $${(priceCents / 100).toFixed(2)} ARS\n\n¿Confirmas esta reserva?`,
          };
        } catch (error) {
          console.error('Error en schedule_appointment:', error);
          return {
            ok: false,
            message: 'Ocurrió un error al preparar la reserva. Intenta de nuevo.',
          };
        }
      },
    });
  }
}
