import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CreateAnalysisJobCommand } from '../commands/create-analysis-job.command';
import { AnalysisJob } from '../../../domain/entities/analysis-job.entity';
import { AnalysisJobRepository } from '../../ports/outgoing/analysis-job.repository';

@CommandHandler(CreateAnalysisJobCommand)
export class CreateAnalysisJobHandler implements ICommandHandler<CreateAnalysisJobCommand> {
  constructor(
    @Inject('AnalysisJobRepository')
    private readonly analysisJobRepository: AnalysisJobRepository,
  ) {}

  async execute(command: CreateAnalysisJobCommand): Promise<AnalysisJob> {
    const job = AnalysisJob.create({
      domainId: command.domainId,
      url: command.url,
      htmlContent: command.htmlContent,
    });

    return await this.analysisJobRepository.save(job);
  }
}