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

    /**
     * Formats a date in Spanish (Argentina) format deterministically.
     * Avoids toLocaleString which can be inconsistent across Node.js builds.
     * Format: "27 de diciembre de 2025 a las 10:00"
     */
    private formatDateSpanish(date: Date): string {
        const months = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];

        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        return `${day} de ${month} de ${year} a las ${hours}:${minutes}`;
    }

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

                    // 5. Validate appointmentId exists
                    if (!result.appointmentId) {
                        console.error('[confirm_booking] scheduleAppointment succeeded but returned no appointmentId');
                        return {
                            ok: false,
                            message: 'Error interno: la reserva se creó pero no se obtuvo el ID. Contacta al administrador.',
                        };
                    }

                    // 6. Marcar como confirmado y limpiar contexto
                    conversation.context.pendingBooking = undefined;
                    conversation.context.lastMentionedAppointmentId = result.appointmentId;
                    await this.conversationRepo.save(conversation);

                    // Format date deterministically (avoid toLocaleString inconsistencies)
                    const appointmentDate = new Date(pending.datetime);
                    const formattedDate = this.formatDateSpanish(appointmentDate);

                    return {
                        ok: true,
                        appointmentId: result.appointmentId,
                        message: `✅ ¡Turno confirmado! Tu reserva para ${pending.serviceName} con ${pending.barberName} el ${formattedDate} ha sido registrada. Te esperamos!`,
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
