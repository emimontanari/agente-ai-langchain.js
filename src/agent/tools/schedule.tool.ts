import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BookingsService } from '../../bookings/bookings.service';

@Injectable()
export class ScheduleTool {
  constructor(private readonly bookings: BookingsService) {}

  getTool() {
    return tool(
      async (input) => {
        try {
          return await this.bookings.createAppointment({
            customerName: input.customerName.trim(),
            barberName: input.barberName.trim(),
            serviceName: input.serviceName.trim(),
            startsAt: input.dateTimeIso,
            endsAt: '',
            notes: input.notes ?? '',
          });
        } catch (err: any) {
          return JSON.stringify({
            ok: false,
            error: err?.message ?? 'Error desconocido al agendar',
            code: 'SCHEDULE_FAILED',
          });
        }
      },
      {
        name: 'schedule_appointment',
        description:
          'Agenda un turno. Acepta nombres y un datetime ISO. Devuelve JSON {ok:true/false}.',
        schema: z.object({
          customerName: z
            .string()
            .min(1)
            .describe('Nombre del cliente (ej: Emi)'),
          barberName: z
            .string()
            .min(1)
            .describe('Nombre del peluquero (ej: "Juan")'),
          serviceName: z
            .string()
            .min(1)
            .describe('Nombre del servicio (ej: "Corte")'),
          dateTimeIso: z
            .string()
            .min(10)
            .describe('Fecha/hora ISO 8601 (local)'),
          notes: z.string().optional(),
        }),
      },
    );
  }
}
