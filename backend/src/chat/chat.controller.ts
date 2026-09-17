import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';

import { type ArchitectResponse } from '../ai/domain/architect-response.model';
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
    return this.aiCompletion.complete({
      prompt: dto.prompt,
      userId: user.userId,
    });
  }
}
