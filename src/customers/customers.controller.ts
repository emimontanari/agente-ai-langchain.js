import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { CustomersService, CustomerWithStats } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';
import { Customer } from '../database/entities/customer.entity';

@Controller('api/customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    async findAll(): Promise<CustomerWithStats[]> {
        return this.customersService.findAll();
    }

    @Get('search')
    async findByPhone(@Query('phone') phone: string): Promise<Customer | null> {
        return this.customersService.findByPhone(phone);
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<CustomerWithStats> {
        return this.customersService.findOne(id);
    }

    @Post()
    async create(@Body() createCustomerDto: CreateCustomerDto): Promise<Customer> {
        return this.customersService.create(createCustomerDto);
    }

    @Put(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateCustomerDto: UpdateCustomerDto,
    ): Promise<Customer> {
        return this.customersService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.customersService.remove(id);
    }
}
