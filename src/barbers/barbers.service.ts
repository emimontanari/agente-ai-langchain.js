import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Barber } from '../database/entities/barber.entity';
import { BarberSchedule } from '../database/entities/barber-schedule.entity';
import { CreateBarberDto, UpdateBarberDto } from './dto/barber.dto';

export interface BarberWithStats extends Barber {
    totalAppointments: number;
    completedAppointments: number;
    totalRevenue: number;
    averageRating?: number;
}

@Injectable()
export class BarbersService {
    constructor(
        @InjectRepository(Barber)
        private readonly barberRepository: Repository<Barber>,
        @InjectRepository(BarberSchedule)
        private readonly scheduleRepository: Repository<BarberSchedule>,
    ) { }

    async findAll(): Promise<BarberWithStats[]> {
        const barbers = await this.barberRepository.find({
            order: { createdAt: 'DESC' },
            relations: ['schedules'],
        });

        // TODO: Compute stats from appointments when appointments module is ready
        return barbers.map((barber) => ({
            ...barber,
            totalAppointments: 0,
            completedAppointments: 0,
            totalRevenue: 0,
        }));
    }

    async findActive(): Promise<Barber[]> {
        return this.barberRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
            relations: ['schedules'],
        });
    }

    async findOne(id: string): Promise<BarberWithStats> {
        const barber = await this.barberRepository.findOne({
            where: { id },
            relations: ['schedules'],
        });

        if (!barber) {
            throw new NotFoundException(`Barber with ID ${id} not found`);
        }

        // TODO: Compute stats from appointments
        return {
            ...barber,
            totalAppointments: 0,
            completedAppointments: 0,
            totalRevenue: 0,
        };
    }

    async create(createBarberDto: CreateBarberDto): Promise<Barber> {
        const barber = this.barberRepository.create({
            name: createBarberDto.name,
            phone: createBarberDto.phone,
            email: createBarberDto.email,
            specialty: createBarberDto.specialty,
            isActive: true,
        });

        const savedBarber = await this.barberRepository.save(barber);

        // Create schedules
        if (createBarberDto.schedule && createBarberDto.schedule.length > 0) {
            const schedules = createBarberDto.schedule.map((s) =>
                this.scheduleRepository.create({
                    barberId: savedBarber.id,
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                }),
            );
            await this.scheduleRepository.save(schedules);
        }

        return this.barberRepository.findOne({
            where: { id: savedBarber.id },
            relations: ['schedules'],
        }) as Promise<Barber>;
    }

    async update(id: string, updateBarberDto: UpdateBarberDto): Promise<Barber> {
        const barber = await this.barberRepository.findOne({
            where: { id },
            relations: ['schedules'],
        });

        if (!barber) {
            throw new NotFoundException(`Barber with ID ${id} not found`);
        }

        if (updateBarberDto.name !== undefined) {
            barber.name = updateBarberDto.name;
        }
        if (updateBarberDto.phone !== undefined) {
            barber.phone = updateBarberDto.phone;
        }
        if (updateBarberDto.email !== undefined) {
            barber.email = updateBarberDto.email;
        }
        if (updateBarberDto.specialty !== undefined) {
            barber.specialty = updateBarberDto.specialty;
        }
        if (updateBarberDto.isActive !== undefined) {
            barber.isActive = updateBarberDto.isActive;
        }

        await this.barberRepository.save(barber);

        // Update schedules if provided
        if (updateBarberDto.schedule !== undefined) {
            await this.scheduleRepository.delete({ barberId: id });
            const schedules = updateBarberDto.schedule.map((s) =>
                this.scheduleRepository.create({
                    barberId: id,
                    dayOfWeek: s.dayOfWeek,
                    startTime: s.startTime,
                    endTime: s.endTime,
                }),
            );
            await this.scheduleRepository.save(schedules);
        }

        return this.barberRepository.findOne({
            where: { id },
            relations: ['schedules'],
        }) as Promise<Barber>;
    }

    async toggleActive(id: string): Promise<Barber> {
        const barber = await this.barberRepository.findOne({
            where: { id },
            relations: ['schedules'],
        });

        if (!barber) {
            throw new NotFoundException(`Barber with ID ${id} not found`);
        }

        barber.isActive = !barber.isActive;
        return this.barberRepository.save(barber);
    }

    async remove(id: string): Promise<void> {
        const barber = await this.barberRepository.findOne({ where: { id } });
        if (!barber) {
            throw new NotFoundException(`Barber with ID ${id} not found`);
        }
        await this.barberRepository.remove(barber);
    }
}
