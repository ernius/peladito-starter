import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  controllers: [ChatController],
  imports: [AiModule],
})
export class ChatModule {}
