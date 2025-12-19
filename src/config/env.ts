import 'dotenv/config'; // <-- carga .env automáticamente al arrancar el proceso
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.string().default('development'),
  PORT: z.coerce.number().default(3000),

  APP_URL: z.string().min(1),

  DATABASE_URL: z.string().min(1),
  OPENAI_API_KEY: z.string().min(1),

  // Si todavía no usás Better Auth, podés hacerlos opcionales por ahora:
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.string().min(1).optional(),
});

export const env = schema.parse(process.env);
