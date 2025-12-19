import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

export type AppointmentStatus =
  | 'reserved'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'no_show';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'customer_id', type: 'uuid', nullable: true })
  customerId?: string;

  @Column({ name: 'barber_id', type: 'uuid' })
  barberId!: string;

  @Column({ name: 'service_id', type: 'uuid' })
  serviceId!: string;

  @Column({ name: 'starts_at', type: 'timestamptz' })
  startsAt!: Date;

  @Column({ name: 'ends_at', type: 'timestamptz' })
  endsAt!: Date;

  @Column({ type: 'varchar', default: 'reserved' })
  status!: AppointmentStatus;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
