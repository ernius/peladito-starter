import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';

import {
  DecisionStatus,
  Confidence,
  type ArchitectResponse,
} from '../ai/domain/architect-response.model';
import { ResponseStatus } from '../ai/domain/evaluation-case.model';
import { AiCompletionService } from '../ai/ai-completion.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/jwt.strategy';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  prompt!: string;
}

@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(private readonly aiCompletion: AiCompletionService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async chat(
    @Body() dto: ChatRequestDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<ArchitectResponse> {
    const resp = await this.aiCompletion.complete({
      prompt: dto.prompt,
      userId: user.userId,
    });

    return {
      intent: 'EXPLAIN_DECISION',
      status: ResponseStatus.ANSWERED,
      plainLanguageAnswer: resp.text,
      decisionStatus: DecisionStatus.ACTIVE,
      sources: [],
      confidence: Confidence.HIGH,
    };
  }
}
