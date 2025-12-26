import {
    IsString,
    IsOptional,
    IsEmail,
    IsBoolean,
    IsArray,
    ValidateNested,
    IsInt,
    Min,
    Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class WorkScheduleDto {
    @IsInt()
    @Min(0)
    @Max(6)
    dayOfWeek!: number;

    @IsString()
    startTime!: string; // "HH:mm"

    @IsString()
    endTime!: string; // "HH:mm"
}

export class CreateBarberDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    specialty?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkScheduleDto)
    schedule!: WorkScheduleDto[];
}

export class UpdateBarberDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    phone?: string;

    @IsOptional()
    @IsEmail()
    email?: string;

    @IsOptional()
    @IsString()
    specialty?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => WorkScheduleDto)
    schedule?: WorkScheduleDto[];

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
