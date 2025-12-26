import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import {
    AppointmentsService,
    AppointmentWithRelations,
} from './appointments.service';
import {
    CreateAppointmentDto,
    UpdateAppointmentDto,
    UpdateStatusDto,
} from './dto/appointment.dto';
import type { AppointmentStatus } from '../database/entities/appointment.entity';

@Controller('api/appointments')
export class AppointmentsController {
    constructor(private readonly appointmentsService: AppointmentsService) { }

    @Get()
    async findAll(
        @Query('date') date?: string,
        @Query('barberId') barberId?: string,
        @Query('status') status?: AppointmentStatus,
    ): Promise<AppointmentWithRelations[]> {
        return this.appointmentsService.findAll({ date, barberId, status });
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<AppointmentWithRelations> {
        return this.appointmentsService.findOne(id);
    }

    @Post()
    async create(
        @Body() createAppointmentDto: CreateAppointmentDto,
    ): Promise<AppointmentWithRelations> {
        return this.appointmentsService.create(createAppointmentDto);
    }

    @Put(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateAppointmentDto: UpdateAppointmentDto,
    ): Promise<AppointmentWithRelations> {
        return this.appointmentsService.update(id, updateAppointmentDto);
    }

    @Patch(':id/status')
    async updateStatus(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateStatusDto: UpdateStatusDto,
    ): Promise<AppointmentWithRelations> {
        return this.appointmentsService.updateStatus(id, updateStatusDto.status);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.appointmentsService.remove(id);
    }
}
