import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeormConfig } from './typeorm.config';
import { Appointment } from './entities/appointment.entity';
import { Barber } from './entities/barber.entity';
import { Service } from './entities/service.entity';
import { Conversation } from './entities/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot(typeormConfig),
    TypeOrmModule.forFeature([Appointment, Barber, Service, Conversation]),
  ],
})
export class DatabaseModule { }
