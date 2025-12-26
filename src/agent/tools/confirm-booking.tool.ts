import { Injectable } from '@nestjs/common';
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { BookingsService } from '../../bookings/bookings.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../../database/entities/conversation.entity';

@Injectable()
export class ConfirmBookingTool {
    constructor(
        private readonly bookingsService: BookingsService,
        @InjectRepository(Conversation)
        private conversationRepo: Repository<Conversation>,
    ) { }

    getTool() {
        return new DynamicStructuredTool({
            name: 'confirm_booking',
            description:
                'Confirma y ejecuta una reserva que está pendiente de confirmación. Solo usar después de que el cliente confirme explícitamente.',
            schema: z.object({
                conversationId: z.string().uuid(),
                customerName: z.string(),
                customerEmail: z.string().email().optional(),
                customerPhone: z.string().optional(),
            }),
            func: async ({
                conversationId,
                customerName,
                customerEmail,
                customerPhone,
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

                    // 2. Verificar que hay un booking pendiente
                    const pending = conversation.context?.pendingBooking;

                    if (!pending || pending.confirmed) {
                        return {
                            ok: false,
                            message:
                                'No hay ninguna reserva pendiente de confirmación. Primero debes crear una reserva.',
                        };
                    }

                    // 3. Validar que tenemos todos los datos
                    if (!pending.serviceId || !pending.barberId || !pending.datetime) {
                        return {
                            ok: false,
                            message:
                                'Faltan datos para confirmar la reserva. Por favor vuelve a intentarlo.',
                        };
                    }

                    // 4. Crear el turno en la base de datos
                    const result = await this.bookingsService.scheduleAppointment({
                        barberId: pending.barberId,
                        serviceId: pending.serviceId,
                        startsAt: new Date(pending.datetime),
                        customerName,
                        customerEmail,
                        customerPhone,
                    });

                    if (!result.ok) {
                        return {
                            ok: false,
                            message:
                                result.message ||
                                'No se pudo confirmar la reserva. Por favor intenta con otro horario.',
                        };
                    }

                    // 5. Marcar como confirmado y limpiar contexto
                    conversation.context.pendingBooking = undefined;
                    conversation.context.lastMentionedAppointmentId = result.appointmentId;
                    await this.conversationRepo.save(conversation);

                    return {
                        ok: true,
                        appointmentId: result.appointmentId,
                        message: `✅ ¡Turno confirmado! Tu reserva para ${pending.serviceName} con ${pending.barberName} el ${new Date(pending.datetime).toLocaleString('es-AR', { dateStyle: 'long', timeStyle: 'short' })} ha sido registrada. Te esperamos!`,
                    };
                } catch (error) {
                    console.error('Error en confirm_booking:', error);
                    return {
                        ok: false,
                        message:
                            'Ocurrió un error al confirmar la reserva. Por favor intenta nuevamente.',
                    };
                }
            },
        });
    }
}
