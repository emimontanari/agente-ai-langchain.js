import { DataSourceOptions } from 'typeorm';
import { env } from '../config/env';
import { Barber } from './entities/barber.entity';
import { Service } from './entities/service.entity';
import { Appointment } from './entities/appointment.entity';
import { Customer } from './entities/customer.entity';

export const typeormConfig: DataSourceOptions = {
  type: 'postgres',
  url: env.DATABASE_URL,
  ssl:
    env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,

  // ✅ Para arrancar rápido en dev:
  synchronize: env.NODE_ENV !== 'production',
  logging: env.NODE_ENV !== 'production',

  entities: [Customer, Barber, Service, Appointment],

  // ✅ Si migrás con TypeORM más adelante:
  migrations: ['dist/database/migrations/*.js'],
};
