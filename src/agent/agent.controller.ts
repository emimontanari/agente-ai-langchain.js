import { Controller, Post, Body, Res } from '@nestjs/common';
import { AgentService } from './agent.service';
import type { Response } from 'express';

@Controller('agent')
export class AgentController {
  constructor(private readonly agentService: AgentService) { }

  @Post('chat')
  async chat(
    @Body() body: { message: string; userId: string; conversationId: string; stream?: boolean },
    @Res() res: Response,
  ) {
    if (body.stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const stream = this.agentService.processMessageStream(
        body.message,
        body.userId,
        body.conversationId,
      );

      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
      }

      res.write('data: [DONE]\n\n');
      return res.end();
    } else {
      const response = await this.agentService.processMessage(
        body.message,
        body.userId,
        body.conversationId,
      );
      return res.json({
        success: true,
        response,
      });
    }
  }
}
