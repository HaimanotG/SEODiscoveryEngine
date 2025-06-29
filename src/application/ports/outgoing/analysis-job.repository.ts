import { AnalysisJob } from '../../../domain/entities/analysis-job.entity';

export interface AnalysisJobRepository {
  findById(id: number): Promise<AnalysisJob | null>;
  findByDomainId(domainId: number): Promise<AnalysisJob[]>;
  findRecentByDomainId(domainId: number, limit: number): Promise<AnalysisJob[]>;
  findRetryableJobs(): Promise<AnalysisJob[]>;
  save(job: Omit<AnalysisJob, 'id' | 'createdAt' | 'updatedAt'>): Promise<AnalysisJob>;
  update(id: number, updates: Partial<AnalysisJob>): Promise<AnalysisJob>;
  delete(id: number): Promise<void>;
}