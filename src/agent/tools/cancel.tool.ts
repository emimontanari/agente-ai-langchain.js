import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BookingsService } from '../../bookings/bookings.service';

@Injectable()
export class CancelTool {
  constructor(private readonly bookings: BookingsService) {}

  getTool() {
    return tool(
      async (input) => {
        try {
          return await this.bookings.cancelAppointment(
            input.appointmentId,
            input.reason,
          );
        } catch (err: any) {
          return JSON.stringify({
            ok: false,
            error: err?.message ?? 'Error desconocido al cancelar',
            code: 'CANCEL_FAILED',
          });
        }
      },
      {
        name: 'cancel_appointment',
        description: 'Cancela un turno existente en la peluquería',
        schema: z.object({
          appointmentId: z.string().describe('ID único del turno a cancelar'),
          reason: z.string().optional().describe('Razón de la cancelación'),
        }),
      },
    );
  }
}
