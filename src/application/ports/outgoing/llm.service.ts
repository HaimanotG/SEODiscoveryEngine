import { JsonLdSchema } from '../../../domain/entities/analysis-job.entity';

export interface LlmAnalysisResult {
  jsonLd: JsonLdSchema;
  confidence: number;
  processingTime: number;
}

export interface LlmService {
  generateSchemaFromHtml(html: string, url: string): Promise<LlmAnalysisResult>;
  getProviderName(): string;
  isConfigured(): boolean;
}