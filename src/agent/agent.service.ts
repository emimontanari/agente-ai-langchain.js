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
  ) {}

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

  async processMessage(userMessage: string): Promise<string> {
    try {
      // Forzar uso de tools cuando se mencione servicios/precios
      let enhancedMessage = userMessage;
      const needsServices =
        /precio|precios|servicios|cu[aá]nto cuesta|costo/i.test(userMessage);

      if (needsServices) {
        const services = await this.bookingsService.listServices();
        enhancedMessage = `${userMessage}\n\nServicios disponibles (base de datos):\n${JSON.stringify(services, null, 2)}`;
      }

      const result = await this.agent.invoke({
        input: enhancedMessage,
      });
      return result.output;
    } catch (error) {
      console.error('Error en agente:', error);
      return 'Lo siento, ocurrió un error procesando tu solicitud. Por favor, intenta de nuevo.';
    }
  }
}
