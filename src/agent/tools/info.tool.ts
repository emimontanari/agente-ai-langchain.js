import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { BookingsService } from '../../bookings/bookings.service';

@Injectable()
export class InfoTool {
  constructor(private readonly bookings: BookingsService) {}

  getTool() {
    return tool(
      async (input) => {
        try {
          const services = await this.bookings.listServices();

          if (services.length === 0) {
            return JSON.stringify({
              ok: false,
              error: 'No hay servicios disponibles en este momento.',
              code: 'NO_SERVICES',
            });
          }

          if (input.type === 'services') {
            return JSON.stringify({
              ok: true,
              data: services,
            });
          }

          if (input.type === 'prices') {
            const pricesList = services.map(
              (s) => `${s.name}: $${s.priceArs} (${s.durationMinutes} minutos)`,
            );
            return JSON.stringify({
              ok: true,
              data: pricesList,
            });
          }

          return JSON.stringify({
            ok: false,
            error: 'Tipo de información no válido. Usa "services" o "prices".',
            code: 'INVALID_TYPE',
          });
        } catch (err: any) {
          return JSON.stringify({
            ok: false,
            error: err?.message ?? 'Error desconocido al obtener información',
            code: 'INFO_FAILED',
          });
        }
      },
      {
        name: 'get_info',
        description:
          'Obtiene información sobre servicios y precios de la peluquería (SIEMPRE en ARS)',
        schema: z.object({
          type: z
            .enum(['services', 'prices'])
            .describe('Tipo de información a obtener'),
        }),
      },
    );
  }
}
