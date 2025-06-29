import { IQuery } from '@nestjs/cqrs';

export class GetAnalysisJobQuery implements IQuery {
  constructor(
    public readonly jobId: number,
  ) {}
}