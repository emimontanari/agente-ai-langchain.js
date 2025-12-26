import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from '../database/entities/service.entity';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';

@Injectable()
export class ServicesService {
    constructor(
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
    ) { }

    async findAll(): Promise<Service[]> {
        return this.serviceRepository.find({
            order: { createdAt: 'DESC' },
        });
    }

    async findActive(): Promise<Service[]> {
        return this.serviceRepository.find({
            where: { isActive: true },
            order: { name: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Service> {
        const service = await this.serviceRepository.findOne({ where: { id } });
        if (!service) {
            throw new NotFoundException(`Service with ID ${id} not found`);
        }
        return service;
    }

    async create(createServiceDto: CreateServiceDto): Promise<Service> {
        const service = this.serviceRepository.create({
            name: createServiceDto.name,
            description: createServiceDto.description,
            durationMinutes: createServiceDto.duration,
            priceCents: createServiceDto.price,
            isActive: true,
        });
        return this.serviceRepository.save(service);
    }

    async update(id: string, updateServiceDto: UpdateServiceDto): Promise<Service> {
        const service = await this.findOne(id);

        if (updateServiceDto.name !== undefined) {
            service.name = updateServiceDto.name;
        }
        if (updateServiceDto.description !== undefined) {
            service.description = updateServiceDto.description;
        }
        if (updateServiceDto.duration !== undefined) {
            service.durationMinutes = updateServiceDto.duration;
        }
        if (updateServiceDto.price !== undefined) {
            service.priceCents = updateServiceDto.price;
        }
        if (updateServiceDto.isActive !== undefined) {
            service.isActive = updateServiceDto.isActive;
        }

        return this.serviceRepository.save(service);
    }

    async toggleActive(id: string): Promise<Service> {
        const service = await this.findOne(id);
        service.isActive = !service.isActive;
        return this.serviceRepository.save(service);
    }

    async remove(id: string): Promise<void> {
        const service = await this.findOne(id);
        await this.serviceRepository.remove(service);
    }
}
