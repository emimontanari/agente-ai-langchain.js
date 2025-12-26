import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { Service } from '../database/entities/service.entity';
import { BookingsModule } from '../bookings/bookings.module';
import { ScheduleTool } from './tools/schedule.tool';
import { CancelTool } from './tools/cancel.tool';
import { InfoTool } from './tools/info.tool';
import { StatusTool } from './tools/status.tool';
import { ListBarbersTool } from './tools/list-barbers.tool';
import { ResolveDatetimeTool } from './tools/resolve-datetime.tool';
import { ConfirmBookingTool } from './tools/confirm-booking.tool';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Service]),
    BookingsModule,
  ],
  controllers: [AgentController],
  providers: [
    AgentService,
    ScheduleTool,
    CancelTool,
    InfoTool,
    StatusTool,
    ListBarbersTool,
    ResolveDatetimeTool,
    ConfirmBookingTool,
  ],
})
export class AgentModule { }
