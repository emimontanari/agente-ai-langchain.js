import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarbersController } from './barbers.controller';
import { BarbersService } from './barbers.service';
import { Barber } from '../database/entities/barber.entity';
import { BarberSchedule } from '../database/entities/barber-schedule.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Barber, BarberSchedule])],
    controllers: [BarbersController],
    providers: [BarbersService],
    exports: [BarbersService],
})
export class BarbersModule { }
