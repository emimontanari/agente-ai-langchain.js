import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../database/entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

export interface CustomerWithStats extends Customer {
    totalVisits: number;
    totalSpent: number;
    lastVisit?: Date;
    favoriteServices: string[];
    averageFrequency: number;
}

@Injectable()
export class CustomersService {
    constructor(
        @InjectRepository(Customer)
        private readonly customerRepository: Repository<Customer>,
    ) { }

    async findAll(): Promise<CustomerWithStats[]> {
        const customers = await this.customerRepository.find({
            order: { createdAt: 'DESC' },
        });

        // TODO: Compute stats from appointments when ready
        return customers.map((customer) => ({
            ...customer,
            totalVisits: 0,
            totalSpent: 0,
            favoriteServices: [],
            averageFrequency: 0,
        }));
    }

    async findOne(id: string): Promise<CustomerWithStats> {
        const customer = await this.customerRepository.findOne({ where: { id } });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        // TODO: Compute stats from appointments
        return {
            ...customer,
            totalVisits: 0,
            totalSpent: 0,
            favoriteServices: [],
            averageFrequency: 0,
        };
    }

    async findByPhone(phone: string): Promise<Customer | null> {
        return this.customerRepository.findOne({ where: { phone } });
    }

    async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
        const customer = this.customerRepository.create({
            name: createCustomerDto.name,
            phone: createCustomerDto.phone,
            email: createCustomerDto.email,
            notes: createCustomerDto.notes,
        });
        return this.customerRepository.save(customer);
    }

    async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
        const customer = await this.customerRepository.findOne({ where: { id } });

        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }

        if (updateCustomerDto.name !== undefined) {
            customer.name = updateCustomerDto.name;
        }
        if (updateCustomerDto.phone !== undefined) {
            customer.phone = updateCustomerDto.phone;
        }
        if (updateCustomerDto.email !== undefined) {
            customer.email = updateCustomerDto.email;
        }
        if (updateCustomerDto.notes !== undefined) {
            customer.notes = updateCustomerDto.notes;
        }

        return this.customerRepository.save(customer);
    }

    async remove(id: string): Promise<void> {
        const customer = await this.customerRepository.findOne({ where: { id } });
        if (!customer) {
            throw new NotFoundException(`Customer with ID ${id} not found`);
        }
        await this.customerRepository.remove(customer);
    }
}
