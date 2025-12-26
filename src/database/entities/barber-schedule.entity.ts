import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Barber } from './barber.entity';

@Entity('barber_schedules')
export class BarberSchedule {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ name: 'barber_id', type: 'uuid' })
    barberId!: string;

    @Column({ name: 'day_of_week', type: 'int' })
    dayOfWeek!: number; // 0-6, 0 = Sunday

    @Column({ name: 'start_time', type: 'time' })
    startTime!: string;

    @Column({ name: 'end_time', type: 'time' })
    endTime!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @ManyToOne(() => Barber, (barber) => barber.schedules, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'barber_id' })
    barber!: Barber;
}
