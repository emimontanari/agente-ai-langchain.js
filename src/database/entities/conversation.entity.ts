import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('simple-json')
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;

  @Column('simple-json', { nullable: true })
  context: {
    pendingBooking?: {
      serviceId?: string;
      serviceName?: string;
      barberId?: string;
      barberName?: string;
      datetime?: string;
      priceCents?: number;
      confirmed: boolean;
    };
    lastMentionedAppointmentId?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
