import { Injectable } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Appointment } from '../database/entities/appointment.entity';
import { Service } from '../database/entities/service.entity';
import { Barber } from '../database/entities/barber.entity';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private serviceRepository: Repository<Service>,
    @InjectRepository(Barber)
    private barberRepository: Repository<Barber>,
  ) {}

  async createAppointment(input: {
    customerName: string;
    customerPhone?: string;
    customerEmail?: string;
    barberName?: string;
    serviceName?: string;
    barberId?: string;
    serviceId?: string;
    startsAt: string;
    endsAt: string;
    notes?: string;
  }) {
    try {
      // Si vienen nombres, resolver a IDs
      let barberId = input.barberId;
      let serviceId = input.serviceId;

      if (input.barberName && !barberId) {
        const barber = await this.barberRepository.findOne({
          where: { displayName: ILike(input.barberName.trim()) },
        });
        if (!barber) {
          return JSON.stringify({
            ok: false,
            error: `No encontré al peluquero "${input.barberName}"`,
            code: 'BARBER_NOT_FOUND',
          });
        }
        barberId = barber.id;
      }

      if (input.serviceName && !serviceId) {
        const service = await this.serviceRepository.findOne({
          where: { name: ILike(input.serviceName.trim()) },
        });
        if (!service) {
          return JSON.stringify({
            ok: false,
            error: `No encontré el servicio "${input.serviceName}"`,
            code: 'SERVICE_NOT_FOUND',
          });
        }
        serviceId = service.id;
      }

      // Calcular endsAt si no viene
      let endsAt = input.endsAt;
      if (!endsAt && serviceId) {
        const service = await this.serviceRepository.findOne({
          where: { id: serviceId },
        });
        if (service) {
          const start = new Date(input.startsAt);
          endsAt = new Date(
            start.getTime() + service.durationMinutes * 60_000,
          ).toISOString();
        }
      }

      const appointment = this.appointmentRepository.create({
        barberId: barberId!,
        serviceId: serviceId!,
        startsAt: new Date(input.startsAt),
        endsAt: new Date(endsAt || input.endsAt),
        status: 'reserved',
        notes: input.notes || '',
      });

      const saved = await this.appointmentRepository.save(appointment);

      return JSON.stringify({
        ok: true,
        appointmentId: saved.id,
        startsAt: saved.startsAt.toISOString(),
        endsAt: saved.endsAt.toISOString(),
        status: saved.status,
      });
    } catch (err: any) {
      return JSON.stringify({
        ok: false,
        error: err?.message ?? 'Error desconocido al agendar',
        code: 'SCHEDULE_FAILED',
      });
    }
  }

  async cancelAppointment(appointmentId: string, reason?: string) {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
    });

    if (!appointment) {
      return 'Turno no encontrado. Verifica el ID proporcionado.';
    }

    if (appointment.status === 'cancelled') {
      return 'Este turno ya fue cancelado previamente.';
    }

    appointment.status = 'cancelled';
    if (reason) {
      appointment.notes =
        (appointment.notes || '') + `\nMotivo cancelación: ${reason}`;
    }
    await this.appointmentRepository.save(appointment);

    return `Turno cancelado exitosamente. ID: ${appointmentId}`;
  }

  async getServices(type: 'services' | 'prices') {
    const services = await this.serviceRepository.find({
      where: { isActive: true },
    });

    if (services.length === 0) {
      return 'No hay servicios disponibles en este momento.';
    }

    if (type === 'services') {
      return JSON.stringify(
        services.map((s) => ({
          id: s.id,
          name: s.name,
          description: s.description,
          price: s.priceCents / 100,
          duration: s.durationMinutes,
        })),
        null,
        2,
      );
    }

    if (type === 'prices') {
      return services
        .map(
          (s) =>
            `${s.name}: $${s.priceCents / 100} (${s.durationMinutes} minutos)`,
        )
        .join('\n');
    }

    return 'Tipo de información no válido. Usa "services" o "prices".';
  }

  async listServices() {
    const services = await this.serviceRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });

    return services.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      durationMinutes: s.durationMinutes,
      priceArs: (s.priceCents / 100).toFixed(2),
    }));
  }

  async listBarbers() {
    const barbers = await this.barberRepository.find({
      where: { isActive: true },
      order: { displayName: 'ASC' },
    });

    return barbers.map((b) => ({
      id: b.id,
      name: b.displayName,
      isAvailable: b.isActive,
    }));
  }

  async checkStatus(type: 'appointment' | 'barber', id: string) {
    if (type === 'appointment') {
      const appointment = await this.appointmentRepository.findOne({
        where: { id },
      });

      if (!appointment) {
        return 'Turno no encontrado.';
      }

      return JSON.stringify(
        {
          id: appointment.id,
          customerId: appointment.customerId,
          barberId: appointment.barberId,
          serviceId: appointment.serviceId,
          scheduledTime: appointment.startsAt,
          status: appointment.status,
          notes: appointment.notes,
        },
        null,
        2,
      );
    }

    if (type === 'barber') {
      const barber = await this.barberRepository.findOne({
        where: { id },
      });

      if (!barber) {
        return 'Peluquero no encontrado.';
      }

      return JSON.stringify(
        {
          id: barber.id,
          name: barber.displayName,
          isAvailable: barber.isActive,
          specialties: 'No especificado',
        },
        null,
        2,
      );
    }

    return 'Tipo de consulta no válido. Usa "appointment" o "barber".';
  }
}
