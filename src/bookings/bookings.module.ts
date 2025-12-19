import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { Customer } from '../database/entities/customer.entity';
import { Appointment } from '../database/entities/appointment.entity';
import { Service } from '../database/entities/service.entity';
import { Barber } from '../database/entities/barber.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, Appointment, Service, Barber])],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
