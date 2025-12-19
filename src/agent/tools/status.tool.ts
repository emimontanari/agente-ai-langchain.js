import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BookingsService } from '../../bookings/bookings.service';

@Injectable()
export class StatusTool {
  constructor(private readonly bookings: BookingsService) {}

  getTool() {
    return tool(
      async (input) => {
        try {
          return await this.bookings.checkStatus(input.type, input.id);
        } catch (err: any) {
          return JSON.stringify({
            ok: false,
            error: err?.message ?? 'Error desconocido al verificar estado',
            code: 'STATUS_FAILED',
          });
        }
      },
      {
        name: 'check_status',
        description:
          'Verifica el estado de turnos o disponibilidad de peluqueros',
        schema: z.object({
          type: z
            .enum(['appointment', 'barber'])
            .describe('Tipo de entidad a consultar'),
          id: z.string().describe('ID único del turno o peluquero'),
        }),
      },
    );
  }
}
