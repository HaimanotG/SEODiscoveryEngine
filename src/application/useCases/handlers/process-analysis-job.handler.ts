import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { ProcessAnalysisJobCommand } from '../commands/process-analysis-job.command';
import { AnalysisJobRepository } from '../../ports/outgoing/analysis-job.repository';
import { LlmService } from '../../ports/outgoing/llm.service';

@CommandHandler(ProcessAnalysisJobCommand)
export class ProcessAnalysisJobHandler implements ICommandHandler<ProcessAnalysisJobCommand> {
  constructor(
    @Inject('AnalysisJobRepository')
    private readonly analysisJobRepository: AnalysisJobRepository,
    @Inject('LlmService')
    private readonly llmService: LlmService,
  ) {}

  async execute(command: ProcessAnalysisJobCommand): Promise<void> {
    const job = await this.analysisJobRepository.findById(command.jobId);
    if (!job) {
      throw new Error(`Analysis job ${command.jobId} not found`);
    }

    try {
      const processingJob = job.markAsProcessing();
      await this.analysisJobRepository.update(job.id, processingJob);

      const startTime = Date.now();
      const result = await this.llmService.generateSchemaFromHtml(
        job.htmlContent!,
        job.url
      );
      const processingTime = Date.now() - startTime;

      const completedJob = job.markAsCompleted(result.jsonLd, processingTime);
      await this.analysisJobRepository.update(job.id, completedJob);

    } catch (error) {
      const failedJob = job.markAsFailed(error.message);
      await this.analysisJobRepository.update(job.id, failedJob);
      throw error;
    }
  }
}