import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Barber } from '../database/entities/barber.entity';
import { Service } from '../database/entities/service.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function seed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const barberRepo = app.get<Repository<Barber>>(getRepositoryToken(Barber));
  const serviceRepo = app.get<Repository<Service>>(getRepositoryToken(Service));

  // Crear barberos si no existen
  const existingBarbers = await barberRepo.count();
  if (existingBarbers === 0) {
    const barbers = barberRepo.create([
      { name: 'Juan', isActive: true },
      { name: 'Maria', isActive: true },
      { name: 'Carlos', isActive: true },
    ]);
    await barberRepo.save(barbers);
    console.log('✅ Barbers created');
  }

  // Crear servicios si no existen
  const existingServices = await serviceRepo.count();
  if (existingServices === 0) {
    const services = serviceRepo.create([
      {
        name: 'Corte',
        description: 'Corte clásico masculino',
        durationMinutes: 60,
        priceCents: 5000,
        isActive: true,
      },
      {
        name: 'Barba',
        description: 'Arreglo de barba',
        durationMinutes: 30,
        priceCents: 3000,
        isActive: true,
      },
      {
        name: 'Corte + Barba',
        description: 'Paquete completo',
        durationMinutes: 90,
        priceCents: 7000,
        isActive: true,
      },
      {
        name: 'Tinte',
        description: 'Aplicación de tinte',
        durationMinutes: 120,
        priceCents: 8000,
        isActive: true,
      },
    ]);
    await serviceRepo.save(services);
    console.log('✅ Services created');
  }

  await app.close();
  console.log('🌱 Seed completed');
}

seed().catch(console.error);
