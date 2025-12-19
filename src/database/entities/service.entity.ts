import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes!: number;

  @Column({ name: 'price_cents', type: 'int' })
  priceCents!: number;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;
}
