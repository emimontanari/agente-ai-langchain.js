import { Controller, Post, Body } from '@nestjs/common';
import { AgentService } from './agent.service';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) { }

  @Post('chat')
  async chat(
    @Body() body: { message: string; userId: string; conversationId: string },
  ) {
    const response = await this.agentService.processMessage(
      body.message,
      body.userId,
      body.conversationId,
    );
    return {
      success: true,
      response,
    };
  }
}
