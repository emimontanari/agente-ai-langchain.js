import {
    Controller,
    Get,
    Post,
    Put,
    Patch,
    Delete,
    Body,
    Param,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto/service.dto';
import { Service } from '../database/entities/service.entity';

@Controller('api/services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    async findAll(): Promise<Service[]> {
        return this.servicesService.findAll();
    }

    @Get('active')
    async findActive(): Promise<Service[]> {
        return this.servicesService.findActive();
    }

    @Get(':id')
    async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Service> {
        return this.servicesService.findOne(id);
    }

    @Post()
    async create(@Body() createServiceDto: CreateServiceDto): Promise<Service> {
        return this.servicesService.create(createServiceDto);
    }

    @Put(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateServiceDto: UpdateServiceDto,
    ): Promise<Service> {
        return this.servicesService.update(id, updateServiceDto);
    }

    @Patch(':id/toggle')
    async toggleActive(@Param('id', ParseUUIDPipe) id: string): Promise<Service> {
        return this.servicesService.toggleActive(id);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.servicesService.remove(id);
    }
}
