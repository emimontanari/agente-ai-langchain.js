import { IsString, IsOptional, IsInt, IsBoolean, Min } from 'class-validator';

export class CreateServiceDto {
    @IsString()
    name!: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsInt()
    @Min(1)
    duration!: number; // in minutes

    @IsInt()
    @Min(0)
    price!: number; // in cents (pesos * 100)
}

export class UpdateServiceDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsInt()
    @Min(1)
    duration?: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    price?: number;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
