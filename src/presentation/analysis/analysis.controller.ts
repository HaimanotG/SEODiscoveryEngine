import { Controller, Post, Get, Body, Param, UseInterceptors } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateAnalysisJobCommand } from '../../application/useCases/commands/create-analysis-job.command';
import { ProcessAnalysisJobCommand } from '../../application/useCases/commands/process-analysis-job.command';
import { GetAnalysisJobQuery } from '../../application/useCases/queries/get-analysis-job.query';
import { CreateAnalysisJobDto } from '../dto/create-analysis-job.dto';

@Controller('analysis')
export class AnalysisController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('jobs')
  async createJob(@Body() dto: CreateAnalysisJobDto) {
    const command = new CreateAnalysisJobCommand(
      dto.domainId,
      dto.url,
      dto.htmlContent
    );
    
    const job = await this.commandBus.execute(command);
    
    // Trigger processing asynchronously
    this.commandBus.execute(new ProcessAnalysisJobCommand(job.id));
    
    return {
      jobId: job.id,
      status: 'accepted',
      message: 'Analysis job queued for processing'
    };
  }

  @Get('jobs/:id')
  async getJob(@Param('id') id: number) {
    const query = new GetAnalysisJobQuery(id);
    return await this.queryBus.execute(query);
  }

  @Post('jobs/:id/process')
  async processJob(@Param('id') id: number) {
    const command = new ProcessAnalysisJobCommand(id);
    await this.commandBus.execute(command);
    return { message: 'Job processing initiated' };
  }
}