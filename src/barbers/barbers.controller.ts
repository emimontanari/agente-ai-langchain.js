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
import { BarbersService, BarberWithStats } from './barbers.service';
import { CreateBarberDto, UpdateBarberDto } from './dto/barber.dto';
import { Barber } from '../database/entities/barber.entity';

@Controller('api/barbers')
export class BarbersController {
    constructor(private readonly barbersService: BarbersService) { }

    @Get()
    async findAll(): Promise<BarberWithStats[]> {
        return this.barbersService.findAll();
    }

    @Get('active')
    async findActive(): Promise<Barber[]> {
        return this.barbersService.findActive();
    }

    @Get(':id')
    async findOne(
        @Param('id', ParseUUIDPipe) id: string,
    ): Promise<BarberWithStats> {
        return this.barbersService.findOne(id);
    }

    @Post()
    async create(@Body() createBarberDto: CreateBarberDto): Promise<Barber> {
        return this.barbersService.create(createBarberDto);
    }

    @Put(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateBarberDto: UpdateBarberDto,
    ): Promise<Barber> {
        return this.barbersService.update(id, updateBarberDto);
    }

    @Patch(':id/toggle')
    async toggleActive(@Param('id', ParseUUIDPipe) id: string): Promise<Barber> {
        return this.barbersService.toggleActive(id);
    }

    @Delete(':id')
    async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
        return this.barbersService.remove(id);
    }
}
