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
import { ConfirmBookingTool } from './tools/confirm-booking.tool';
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
    private confirmBookingTool: ConfirmBookingTool,
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
      this.confirmBookingTool.getTool(),
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
    const result = await this.executeAgent(userMessage, userId, conversationId);
    return result.output;
  }

  async *processMessageStream(
    userMessage: string,
    userId: string,
    conversationId: string,
  ): AsyncGenerator<string> {
    const { chatHistory, enhancedMessage, conversation } =
      await this.prepareContext(userMessage, userId, conversationId);

    const stream = await this.agent.stream({
      input: enhancedMessage,
      chat_history: chatHistory,
    });

    let fullResponse = '';

    /**
     * LangChain AgentExecutor stream emits chunks with different shapes:
     * - `{ actions: AgentAction[] }` – When the agent decides to call a tool
     * - `{ steps: AgentStep[] }` – After a tool returns (contains `action` and `observation`)
     * - `{ output: string }` – Final output from the agent (this is what we yield)
     * - `{ intermediateSteps: AgentStep[] }` – All intermediate steps so far
     * - Tool-specific chunks may also appear depending on the executor configuration
     *
     * We only yield `chunk.output` to the client as it contains the final response text.
     * Other chunk types represent internal agent reasoning and tool invocations.
     */
    const isDebug = this.configService.get('NODE_ENV') === 'development';

    for await (const chunk of stream) {
      // Debug logging: show all chunk types when in development mode
      if (isDebug) {
        console.debug('[AgentStream] Chunk received:', JSON.stringify(chunk, null, 2));
      }

      if (chunk.output) {
        fullResponse += chunk.output;
        yield chunk.output;
      } else if (isDebug) {
        console.debug('[AgentStream] Skipped chunk (no output field):', Object.keys(chunk));
      }
    }

    // Update conversation at the end
    conversation.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: fullResponse, timestamp: new Date() },
    );
    await this.conversationRepo.save(conversation);
  }

  private async prepareContext(
    userMessage: string,
    userId: string,
    conversationId: string,
  ) {
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

      // Persist immediately so tools can find it by conversationId
      try {
        conversation = await this.conversationRepo.save(conversation);
      } catch (error) {
        console.error('[prepareContext] Failed to persist new conversation:', error);
        throw new Error(`Failed to create conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    const chatHistory: BaseMessage[] = conversation.messages.map((msg) => {
      if (msg.role === 'user') {
        return new HumanMessage(msg.content);
      }
      return new AIMessage(msg.content);
    });

    let enhancedMessage = `[ID: ${conversationId}] ${userMessage}`;
    const needsServices =
      /precio|precios|servicios|cu[aá]nto cuesta|costo/i.test(userMessage);

    if (needsServices) {
      const services = await this.bookingsService.listServices();
      enhancedMessage = `${enhancedMessage}\n\nServicios disponibles (base de datos):\n${JSON.stringify(services, null, 2)}`;
    }

    return { chatHistory, enhancedMessage, conversation };
  }

  private async executeAgent(
    userMessage: string,
    userId: string,
    conversationId: string,
  ) {
    const { chatHistory, enhancedMessage, conversation } =
      await this.prepareContext(userMessage, userId, conversationId);

    const result = await this.agent.invoke({
      input: enhancedMessage,
      chat_history: chatHistory,
    });

    conversation.messages.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: result.output, timestamp: new Date() },
    );

    await this.conversationRepo.save(conversation);
    return result;
  }
}
