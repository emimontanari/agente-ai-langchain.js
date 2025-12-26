import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Appointment, AppointmentStatus } from '../database/entities/appointment.entity';
import { Service } from '../database/entities/service.entity';
import { CreateAppointmentDto, UpdateAppointmentDto } from './dto/appointment.dto';

export interface AppointmentWithRelations {
    id: string;
    customerId?: string;
    customer: { id: string; name: string; phone: string; email?: string } | null;
    serviceId: string;
    service: { id: string; name: string; duration: number; price: number };
    barberId: string;
    barber: { id: string; name: string; specialty?: string };
    date: Date;
    startTime: string;
    endTime: string;
    status: AppointmentStatus;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

@Injectable()
export class AppointmentsService {
    constructor(
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
    ) { }

    private formatTimeFromDate(date: Date): string {
        return date.toTimeString().slice(0, 5);
    }

    private async mapToAppointmentWithRelations(
        appointment: Appointment,
    ): Promise<AppointmentWithRelations> {
        return {
            id: appointment.id,
            customerId: appointment.customerId,
            customer: appointment.customer
                ? {
                    id: appointment.customer.id,
                    name: appointment.customer.name,
                    phone: appointment.customer.phone,
                    email: appointment.customer.email,
                }
                : null,
            serviceId: appointment.serviceId,
            service: {
                id: appointment.service.id,
                name: appointment.service.name,
                duration: appointment.service.durationMinutes,
                price: appointment.service.priceCents,
            },
            barberId: appointment.barberId,
            barber: {
                id: appointment.barber.id,
                name: appointment.barber.name,
                specialty: appointment.barber.specialty,
            },
            date: appointment.startsAt,
            startTime: this.formatTimeFromDate(appointment.startsAt),
            endTime: this.formatTimeFromDate(appointment.endsAt),
            status: appointment.status,
            notes: appointment.notes,
            createdAt: appointment.createdAt,
            updatedAt: appointment.updatedAt,
        };
    }

    async findAll(filters?: {
        date?: string;
        barberId?: string;
        status?: AppointmentStatus;
    }): Promise<AppointmentWithRelations[]> {
        const queryBuilder = this.appointmentRepository
            .createQueryBuilder('appointment')
            .leftJoinAndSelect('appointment.customer', 'customer')
            .leftJoinAndSelect('appointment.barber', 'barber')
            .leftJoinAndSelect('appointment.service', 'service')
            .orderBy('appointment.startsAt', 'DESC');

        if (filters?.date) {
            const startOfDay = new Date(filters.date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(filters.date);
            endOfDay.setHours(23, 59, 59, 999);
            queryBuilder.andWhere('appointment.startsAt BETWEEN :start AND :end', {
                start: startOfDay.toISOString(),
                end: endOfDay.toISOString(),
            });
        }

        if (filters?.barberId) {
            queryBuilder.andWhere('appointment.barberId = :barberId', {
                barberId: filters.barberId,
            });
        }

        if (filters?.status) {
            queryBuilder.andWhere('appointment.status = :status', {
                status: filters.status,
            });
        }

        const appointments = await queryBuilder.getMany();
        return Promise.all(appointments.map((a) => this.mapToAppointmentWithRelations(a)));
    }

    async findOne(id: string): Promise<AppointmentWithRelations> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['customer', 'barber', 'service'],
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        return this.mapToAppointmentWithRelations(appointment);
    }

    async create(createAppointmentDto: CreateAppointmentDto): Promise<AppointmentWithRelations> {
        // Get service to calculate end time
        const service = await this.serviceRepository.findOne({
            where: { id: createAppointmentDto.serviceId },
        });

        if (!service) {
            throw new BadRequestException(
                `Service with ID ${createAppointmentDto.serviceId} not found`,
            );
        }

        // Parse date and time
        const [hours, minutes] = createAppointmentDto.startTime.split(':').map(Number);
        const startsAt = new Date(createAppointmentDto.date);
        startsAt.setHours(hours, minutes, 0, 0);

        // Calculate end time
        const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000);

        const appointment = this.appointmentRepository.create({
            customerId: createAppointmentDto.customerId,
            barberId: createAppointmentDto.barberId,
            serviceId: createAppointmentDto.serviceId,
            startsAt,
            endsAt,
            status: 'reserved',
            notes: createAppointmentDto.notes,
        });

        const saved = await this.appointmentRepository.save(appointment);
        return this.findOne(saved.id);
    }

    async update(
        id: string,
        updateAppointmentDto: UpdateAppointmentDto,
    ): Promise<AppointmentWithRelations> {
        const appointment = await this.appointmentRepository.findOne({
            where: { id },
            relations: ['service'],
        });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        if (updateAppointmentDto.customerId !== undefined) {
            appointment.customerId = updateAppointmentDto.customerId;
        }
        if (updateAppointmentDto.barberId !== undefined) {
            appointment.barberId = updateAppointmentDto.barberId;
        }
        if (updateAppointmentDto.notes !== undefined) {
            appointment.notes = updateAppointmentDto.notes;
        }

        // Handle date/time/service changes
        let serviceChanged = false;
        let service = appointment.service;

        if (updateAppointmentDto.serviceId !== undefined) {
            const newService = await this.serviceRepository.findOne({
                where: { id: updateAppointmentDto.serviceId },
            });
            if (!newService) {
                throw new BadRequestException(
                    `Service with ID ${updateAppointmentDto.serviceId} not found`,
                );
            }
            appointment.serviceId = updateAppointmentDto.serviceId;
            service = newService;
            serviceChanged = true;
        }

        if (updateAppointmentDto.date || updateAppointmentDto.startTime || serviceChanged) {
            const dateStr = updateAppointmentDto.date || appointment.startsAt.toISOString().split('T')[0];
            const timeStr = updateAppointmentDto.startTime || this.formatTimeFromDate(appointment.startsAt);
            const [hours, minutes] = timeStr.split(':').map(Number);
            const startsAt = new Date(dateStr);
            startsAt.setHours(hours, minutes, 0, 0);
            appointment.startsAt = startsAt;
            appointment.endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60 * 1000);
        }

        await this.appointmentRepository.save(appointment);
        return this.findOne(id);
    }

    async updateStatus(id: string, status: AppointmentStatus): Promise<AppointmentWithRelations> {
        const appointment = await this.appointmentRepository.findOne({ where: { id } });

        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }

        appointment.status = status;
        await this.appointmentRepository.save(appointment);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        const appointment = await this.appointmentRepository.findOne({ where: { id } });
        if (!appointment) {
            throw new NotFoundException(`Appointment with ID ${id} not found`);
        }
        await this.appointmentRepository.remove(appointment);
    }
}
