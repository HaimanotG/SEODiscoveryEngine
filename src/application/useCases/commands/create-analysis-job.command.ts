import { ICommand } from '@nestjs/cqrs';

export class CreateAnalysisJobCommand implements ICommand {
  constructor(
    public readonly domainId: number,
    public readonly url: string,
    public readonly htmlContent: string,
  ) {}
}