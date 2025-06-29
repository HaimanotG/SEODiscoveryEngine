import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { GetAnalysisJobQuery } from '../queries/get-analysis-job.query';
import { AnalysisJob } from '../../../domain/entities/analysis-job.entity';
import { AnalysisJobRepository } from '../../ports/outgoing/analysis-job.repository';

@QueryHandler(GetAnalysisJobQuery)
export class GetAnalysisJobHandler implements IQueryHandler<GetAnalysisJobQuery> {
  constructor(
    @Inject('AnalysisJobRepository')
    private readonly analysisJobRepository: AnalysisJobRepository,
  ) {}

  async execute(query: GetAnalysisJobQuery): Promise<AnalysisJob | null> {
    return await this.analysisJobRepository.findById(query.jobId);
  }
}