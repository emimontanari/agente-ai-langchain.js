import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BookingsService } from '../../bookings/bookings.service';

@Injectable()
export class ListBarbersTool {
  constructor(private readonly bookings: BookingsService) {}

  getTool() {
    return tool(
      async () => {
        try {
          const barbers = await this.bookings.listBarbers();

          return JSON.stringify({
            ok: true,
            data: barbers,
          });
        } catch (err: any) {
          return JSON.stringify({
            ok: false,
            error: err?.message ?? 'Error desconocido al obtener peluqueros',
            code: 'BARBERS_FAILED',
          });
        }
      },
      {
        name: 'list_barbers',
        description: 'Obtiene la lista de peluqueros disponibles',
        schema: z.object({}),
      },
    );
  }
}
