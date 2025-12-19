import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResolveDatetimeTool {
  getTool() {
    return tool(
      async (input) => {
        try {
          const { text, timezone = 'America/Argentina/Cordoba' } = input;

          // Patrones simples para fechas relativas
          const now = new Date();
          const today = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );

          let targetDate = new Date(today);

          // Procesar el texto de entrada
          const lowerText = text.toLowerCase().trim();

          if (lowerText.includes('mañana') || lowerText.includes('tomorrow')) {
            targetDate.setDate(today.getDate() + 1);
          } else if (
            lowerText.includes('pasado mañana') ||
            lowerText.includes('day after tomorrow')
          ) {
            targetDate.setDate(today.getDate() + 2);
          } else if (lowerText.includes('hoy') || lowerText.includes('today')) {
            // Mantener hoy
          } else {
            // Intentar parsear como fecha absoluta
            const parsedDate = new Date(text);
            if (!isNaN(parsedDate.getTime())) {
              targetDate = parsedDate;
            }
          }

          // Extraer hora si existe
          const timeMatch = text.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/i);
          if (timeMatch) {
            let [_, hoursStr, minutesStr, period] = timeMatch;
            let hours = parseInt(hoursStr);
            const minutes = parseInt(minutesStr);

            if (period?.toLowerCase() === 'pm' && hours !== 12) {
              hours += 12;
            } else if (period?.toLowerCase() === 'am' && hours === 12) {
              hours = 0;
            }

            targetDate.setHours(hours, minutes, 0, 0);
          } else {
            // Si no hay hora, usar default 15:00
            targetDate.setHours(15, 0, 0, 0);
          }

          return JSON.stringify({
            ok: true,
            data: {
              original: text,
              iso: targetDate.toISOString(),
              formatted: targetDate.toLocaleString('es-AR', {
                timeZone: timezone,
                dateStyle: 'full',
                timeStyle: 'short',
              }),
              timezone,
            },
          });
        } catch (err: any) {
          return JSON.stringify({
            ok: false,
            error: `No pude interpretar la fecha "${input.text}". Usá formato claro como "mañana 15:00" o "2025-12-20T15:00:00"`,
            code: 'DATETIME_PARSE_FAILED',
          });
        }
      },
      {
        name: 'resolve_datetime',
        description:
          'Convierte texto de fecha/hora a ISO 8601. Entiende "mañana 15:00", "hoy 10am", etc',
        schema: z.object({
          text: z
            .string()
            .describe(
              'Texto de fecha/hora a convertir (ej: "mañana 15:00", "hoy 10am")',
            ),
          timezone: z
            .string()
            .optional()
            .describe('Timezone (default: America/Argentina/Cordoba)'),
        }),
      },
    );
  }
}
