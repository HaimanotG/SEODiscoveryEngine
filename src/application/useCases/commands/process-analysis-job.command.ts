import { ICommand } from '@nestjs/cqrs';

export class ProcessAnalysisJobCommand implements ICommand {
  constructor(
    public readonly jobId: number,
  ) {}
}