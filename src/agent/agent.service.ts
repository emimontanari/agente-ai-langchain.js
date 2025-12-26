import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChatOpenAI } from '@langchain/openai';
import {
  AgentExecutor,
  createToolCallingAgent,
} from '@langchain/classic/agents';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { ScheduleTool } from './tools/schedule.tool';
import { CancelTool } from './tools/cancel.tool';
import { InfoTool } from './tools/info.tool';
import { StatusTool } from './tools/status.tool';
import { ListBarbersTool } from './tools/list-barbers.tool';
import { ResolveDatetimeTool } from './tools/resolve-datetime.tool';
import { BookingsService } from '../bookings/bookings.service';
import { SYSTEM_PROMPT } from './prompts/system.prompt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Conversation } from '../database/entities/conversation.entity';
import { BaseMessage, HumanMessage, AIMessage } from '@langchain/core/messages';

@Injectable()
export class AgentService implements OnModuleInit {
  private agent: AgentExecutor;

  constructor(
    private configService: ConfigService,
    private scheduleTool: ScheduleTool,
    private cancelTool: CancelTool,
    private infoTool: InfoTool,
    private statusTool: StatusTool,
    private listBarbersTool: ListBarbersTool,
    private resolveDatetimeTool: ResolveDatetimeTool,
    private bookingsService: BookingsService,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
  ) { }

  onModuleInit() {
    this.initializeAgent();
  }

  private initializeAgent() {
    const llm = new ChatOpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      modelName: 'gpt-4-turbo',
      temperature: 0.7,
    });

    const tools = [
      this.scheduleTool.getTool(),
      this.cancelTool.getTool(),
      this.infoTool.getTool(),
      this.statusTool.getTool(),
      this.listBarbersTool.getTool(),
      this.resolveDatetimeTool.getTool(),
    ];

    const prompt = ChatPromptTemplate.fromMessages([
      ['system', SYSTEM_PROMPT],
      ['placeholder', '{chat_history}'],
      ['human', '{input}'],
      ['placeholder', '{agent_scratchpad}'],
    ]);

    const agentChain = createToolCallingAgent({
      llm,
      tools,
      prompt,
    });

    this.agent = new AgentExecutor({
      agent: agentChain,
      tools,
      verbose: this.configService.get<string>('NODE_ENV') === 'development',
    });
  }

  async processMessage(
    userMessage: string,
    userId: string,
    conversationId: string,
  ): Promise<string> {
    try {
      // 1. Recover existing conversation
      let conversation = await this.conversationRepo.findOne({
        where: { id: conversationId },
      });

      if (!conversation) {
        conversation = this.conversationRepo.create({
          id: conversationId,
          userId,
          messages: [],
          context: {},
        });
      }

      // 2. Prepare chat history for LangChain
      const chatHistory: BaseMessage[] = conversation.messages.map((msg) => {
        if (msg.role === 'user') {
          return new HumanMessage(msg.content);
        }
        return new AIMessage(msg.content);
      });

      // 3. Force usage of tools when mentioning services/prices
      let enhancedMessage = userMessage;
      const needsServices =
        /precio|precios|servicios|cu[aá]nto cuesta|costo/i.test(userMessage);

      // Only add services context if it's not already in recent history regarding services?
      // For now, keep the logic simple as before, but maybe we don't need to append it to the stored message,
      // just to the input sent to the agent.
      if (needsServices) {
        const services = await this.bookingsService.listServices();
        enhancedMessage = `${userMessage}\n\nServicios disponibles (base de datos):\n${JSON.stringify(services, null, 2)}`;
      }

      // 4. Call LangChain with full context
      const result = await this.agent.invoke({
        input: enhancedMessage,
        chat_history: chatHistory,
      });

      // 5. Update conversation
      conversation.messages.push(
        { role: 'user', content: userMessage, timestamp: new Date() },
        { role: 'assistant', content: result.output, timestamp: new Date() },
      );

      await this.conversationRepo.save(conversation);

      return result.output;
    } catch (error) {
      console.error('Error en agente:', error);
      return 'Lo siento, ocurrió un error procesando tu solicitud. Por favor, intenta de nuevo.';
    }
  }
}
