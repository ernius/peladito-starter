import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiModule } from './ai/ai.module';
import { AuthModule } from './auth/auth.module';
import { appConfig } from './config/app.config';
import { authConfig } from './config/auth.config';
import { databaseConfig } from './config/database.config';
import { envValidationSchema } from './config/env.validation';
import { HealthModule } from './health/health.module';
import { UsersModule } from './users/users.module';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, authConfig],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.getOrThrow<string>('database.host'),
        port: config.getOrThrow<number>('database.port'),
        username: config.getOrThrow<string>('database.user'),
        password: config.getOrThrow<string>('database.password'),
        database: config.getOrThrow<string>('database.name'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    ChatModule,
    HealthModule,
    UsersModule,
    AuthModule,
    AiModule,
  ],
})
export class AppModule {}
