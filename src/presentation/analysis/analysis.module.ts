import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AnalysisController } from './analysis.controller';
import { CreateAnalysisJobHandler } from '../../application/useCases/handlers/create-analysis-job.handler';
import { ProcessAnalysisJobHandler } from '../../application/useCases/handlers/process-analysis-job.handler';
import { GetAnalysisJobHandler } from '../../application/useCases/handlers/get-analysis-job.handler';
import { AnalysisJobRepositoryImpl } from '../../infrastructure/repositories/analysis-job.repository.impl';
import { AnalysisJobMapper } from '../../infrastructure/mappers/analysis-job.mapper';
import { DatabaseModule } from '../../infrastructure/persistence/database.module';
import { GeminiLlmService } from '../../infrastructure/services/gemini-llm.service';

@Module({
  imports: [CqrsModule, DatabaseModule],
  controllers: [AnalysisController],
  providers: [
    CreateAnalysisJobHandler,
    ProcessAnalysisJobHandler,
    GetAnalysisJobHandler,
    AnalysisJobMapper,
    {
      provide: 'AnalysisJobRepository',
      useClass: AnalysisJobRepositoryImpl,
    },
    {
      provide: 'LlmService',
      useClass: GeminiLlmService,
    },
  ],
})
export class AnalysisModule {}