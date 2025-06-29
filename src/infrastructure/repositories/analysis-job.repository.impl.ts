import { Injectable, Inject } from '@nestjs/common';
import { eq, desc } from 'drizzle-orm';
import { AnalysisJobRepository } from '../../application/ports/outgoing/analysis-job.repository';
import { AnalysisJob, AnalysisJobStatus } from '../../domain/entities/analysis-job.entity';
import { analysisJobs } from '../../../shared/schema';
import { AnalysisJobMapper } from '../mappers/analysis-job.mapper';

@Injectable()
export class AnalysisJobRepositoryImpl implements AnalysisJobRepository {
  constructor(
    @Inject('DATABASE_CONNECTION') private readonly db: any,
    private readonly mapper: AnalysisJobMapper,
  ) {}

  async findById(id: number): Promise<AnalysisJob | null> {
    const [result] = await this.db
      .select()
      .from(analysisJobs)
      .where(eq(analysisJobs.id, id));
    
    return result ? this.mapper.toDomain(result) : null;
  }

  async findByDomainId(domainId: number): Promise<AnalysisJob[]> {
    const results = await this.db
      .select()
      .from(analysisJobs)
      .where(eq(analysisJobs.domainId, domainId))
      .orderBy(desc(analysisJobs.createdAt));
    
    return results.map(result => this.mapper.toDomain(result));
  }

  async findRecentByDomainId(domainId: number, limit: number): Promise<AnalysisJob[]> {
    const results = await this.db
      .select()
      .from(analysisJobs)
      .where(eq(analysisJobs.domainId, domainId))
      .orderBy(desc(analysisJobs.createdAt))
      .limit(limit);
    
    return results.map(result => this.mapper.toDomain(result));
  }

  async findRetryableJobs(): Promise<AnalysisJob[]> {
    const results = await this.db
      .select()
      .from(analysisJobs)
      .where(eq(analysisJobs.status, AnalysisJobStatus.FAILED))
      .orderBy(desc(analysisJobs.updatedAt));
    
    return results
      .map(result => this.mapper.toDomain(result))
      .filter(job => job.canRetry());
  }

  async save(job: Omit<AnalysisJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisJob> {
    const data = this.mapper.toPersistence(job as AnalysisJob);
    
    const [result] = await this.db
      .insert(analysisJobs)
      .values(data)
      .returning();
    
    return this.mapper.toDomain(result);
  }

  async update(id: number, updates: Partial<AnalysisJob>): Promise<AnalysisJob> {
    const data = this.mapper.toPersistence(updates as AnalysisJob);
    
    const [result] = await this.db
      .update(analysisJobs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(analysisJobs.id, id))
      .returning();
    
    return this.mapper.toDomain(result);
  }

  async delete(id: number): Promise<void> {
    await this.db
      .delete(analysisJobs)
      .where(eq(analysisJobs.id, id));
  }
}