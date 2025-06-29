import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from './presentation/auth/auth.module';
import { UserModule } from './presentation/user/user.module';
import { DomainModule } from './presentation/domain/domain.module';
import { AnalysisModule } from './presentation/analysis/analysis.module';
import { DatabaseModule } from './infrastructure/persistence/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local'],
    }),
    CqrsModule,
    DatabaseModule,
    AuthModule,
    UserModule,
    DomainModule,
    AnalysisModule,
  ],
})
export class AppModule {}