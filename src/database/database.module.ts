import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Appointment } from './entities/appointment.entity';
import { Barber } from './entities/barber.entity';
import { BarberSchedule } from './entities/barber-schedule.entity';
import { Service } from './entities/service.entity';
import { Customer } from './entities/customer.entity';
import { Conversation } from './entities/conversation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      Barber,
      BarberSchedule,
      Service,
      Customer,
      Conversation,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule { }
