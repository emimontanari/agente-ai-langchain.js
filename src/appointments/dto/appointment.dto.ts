import {
    IsString,
    IsOptional,
    IsUUID,
    IsDateString,
    IsIn,
} from 'class-validator';
import type { AppointmentStatus } from '../../database/entities/appointment.entity';

export class CreateAppointmentDto {
    @IsOptional()
    @IsUUID()
    customerId?: string;

    @IsUUID()
    barberId!: string;

    @IsUUID()
    serviceId!: string;

    @IsDateString()
    date!: string; // ISO date string

    @IsString()
    startTime!: string; // "HH:mm"

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateAppointmentDto {
    @IsOptional()
    @IsUUID()
    customerId?: string;

    @IsOptional()
    @IsUUID()
    barberId?: string;

    @IsOptional()
    @IsUUID()
    serviceId?: string;

    @IsOptional()
    @IsDateString()
    date?: string;

    @IsOptional()
    @IsString()
    startTime?: string;

    @IsOptional()
    @IsString()
    notes?: string;
}

export class UpdateStatusDto {
    @IsIn(['reserved', 'confirmed', 'cancelled', 'completed', 'no_show'])
    status!: AppointmentStatus;
}
