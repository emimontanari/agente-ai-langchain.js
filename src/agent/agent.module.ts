import { Module } from '@nestjs/common';
import { AgentController } from './agent.controller';
import { AgentService } from './agent.service';
import { BookingsModule } from '../bookings/bookings.module';
import { ScheduleTool } from './tools/schedule.tool';
import { CancelTool } from './tools/cancel.tool';
import { InfoTool } from './tools/info.tool';
import { StatusTool } from './tools/status.tool';
import { ListBarbersTool } from './tools/list-barbers.tool';
import { ResolveDatetimeTool } from './tools/resolve-datetime.tool';

@Module({
  imports: [BookingsModule],
  controllers: [AgentController],
  providers: [
    AgentService,
    ScheduleTool,
    CancelTool,
    InfoTool,
    StatusTool,
    ListBarbersTool,
    ResolveDatetimeTool,
  ],
})
export class AgentModule {}
