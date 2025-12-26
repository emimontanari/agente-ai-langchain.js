import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AgentModule } from './agent/agent.module';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { databaseConfig } from './config/database.config';
import { ServicesModule } from './services/services.module';
import { BarbersModule } from './barbers/barbers.module';
import { CustomersModule } from './customers/customers.module';
import { AppointmentsModule } from './appointments/appointments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(databaseConfig()),
    AgentModule,
    AuthModule,
    DatabaseModule,
    ServicesModule,
    BarbersModule,
    CustomersModule,
    AppointmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
