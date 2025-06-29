import { Injectable } from '@nestjs/common';
import { AnalysisJob, AnalysisJobStatus } from '../../domain/entities/analysis-job.entity';

@Injectable()
export class AnalysisJobMapper {
  toDomain(raw: any): AnalysisJob {
    return new AnalysisJob(
      raw.id,
      raw.domain_id,
      raw.url,
      raw.status as AnalysisJobStatus,
      raw.html_content,
      raw.generated_json_ld,
      raw.error_message,
      raw.processing_time,
      raw.retry_count,
      raw.created_at,
      raw.updated_at,
    );
  }

  toPersistence(domain: AnalysisJob): any {
    return {
      id: domain.id,
      domain_id: domain.domainId,
      url: domain.url,
      status: domain.status,
      html_content: domain.htmlContent,
      generated_json_ld: domain.generatedJsonLd,
      error_message: domain.errorMessage,
      processing_time: domain.processingTime,
      retry_count: domain.retryCount,
      created_at: domain.createdAt,
      updated_at: domain.updatedAt,
    };
  }
}