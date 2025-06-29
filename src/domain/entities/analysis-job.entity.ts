export enum AnalysisJobStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface JsonLdSchema {
  "@context": string;
  "@type": string;
  [key: string]: any;
}

export class AnalysisJob {
  constructor(
    public readonly id: number,
    public readonly domainId: number,
    public readonly url: string,
    public readonly status: AnalysisJobStatus,
    public readonly htmlContent?: string,
    public readonly generatedJsonLd?: JsonLdSchema,
    public readonly errorMessage?: string,
    public readonly processingTime?: number,
    public readonly retryCount: number = 0,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  public isCompleted(): boolean {
    return this.status === AnalysisJobStatus.COMPLETED;
  }

  public isFailed(): boolean {
    return this.status === AnalysisJobStatus.FAILED;
  }

  public canRetry(): boolean {
    return this.isFailed() && this.retryCount < 3;
  }

  public markAsProcessing(): AnalysisJob {
    return new AnalysisJob(
      this.id,
      this.domainId,
      this.url,
      AnalysisJobStatus.PROCESSING,
      this.htmlContent,
      this.generatedJsonLd,
      this.errorMessage,
      this.processingTime,
      this.retryCount,
      this.createdAt,
      new Date(),
    );
  }

  public markAsCompleted(jsonLd: JsonLdSchema, processingTime: number): AnalysisJob {
    return new AnalysisJob(
      this.id,
      this.domainId,
      this.url,
      AnalysisJobStatus.COMPLETED,
      this.htmlContent,
      jsonLd,
      undefined,
      processingTime,
      this.retryCount,
      this.createdAt,
      new Date(),
    );
  }

  public markAsFailed(errorMessage: string): AnalysisJob {
    return new AnalysisJob(
      this.id,
      this.domainId,
      this.url,
      AnalysisJobStatus.FAILED,
      this.htmlContent,
      this.generatedJsonLd,
      errorMessage,
      this.processingTime,
      this.retryCount + 1,
      this.createdAt,
      new Date(),
    );
  }

  public static create(props: {
    domainId: number;
    url: string;
    htmlContent: string;
  }): Omit<AnalysisJob, 'id' | 'createdAt' | 'updatedAt'> {
    return new AnalysisJob(
      0, // Will be set by repository
      props.domainId,
      props.url,
      AnalysisJobStatus.PENDING,
      props.htmlContent,
      undefined,
      undefined,
      undefined,
      0,
    );
  }
}