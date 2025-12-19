import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('barbers')
export class Barber {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'display_name' })
  displayName!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
