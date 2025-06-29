import { storage } from "../storage.js";
import { LlmAdapter } from "../adapters/llmAdapter.js";
import { OpenAiAdapter } from "../adapters/openaiAdapter.js";
import { GeminiAdapter } from "../adapters/geminiAdapter.js";
import { AnalysisJob, Domain } from "@shared/schema.js";
import { config } from "../config/index.js";

export interface AnalysisJobRequest {
  url: string;
  html: string;
  domainId?: number;
}

export class AnalysisService {
  private getLlmAdapter(): LlmAdapter {
    const provider = config.llm.provider.toLowerCase();
    
    switch (provider) {
      case 'openai':
        return new OpenAiAdapter();
      case 'gemini':
        return new GeminiAdapter();
      default:
        throw new Error(`Unsupported LLM provider: ${provider}`);
    }
  }

  async createAnalysisJob(request: AnalysisJobRequest): Promise<AnalysisJob> {
    try {
      // Find domain by URL if not provided
      let domainId = request.domainId;
      if (!domainId) {
        const hostname = new URL(request.url).hostname;
        const domain = await storage.getDomainByName(hostname);
        if (!domain) {
          throw new Error(`Domain not found for URL: ${request.url}`);
        }
        domainId = domain.id;
      }

      // Create job record
      const job = await storage.createAnalysisJob({
        domainId,
        url: request.url,
        htmlContent: request.html,
        status: 'pending',
      });

      return job;
    } catch (error) {
      throw new Error(`Failed to create analysis job: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async processAnalysisJob(jobId: number): Promise<void> {
    const startTime = Date.now();
    
    try {
      const job = await storage.getAnalysisJob(jobId);
      if (!job) {
        throw new Error(`Job not found: ${jobId}`);
      }

      if (job.status !== 'pending') {
        return; // Job already processed
      }

      // Update status to processing
      await storage.updateAnalysisJob(jobId, {
        status: 'processing',
      });

      // Get LLM adapter
      const llmAdapter = this.getLlmAdapter();
      
      if (!llmAdapter.isConfigured()) {
        throw new Error(`LLM provider not configured: ${llmAdapter.getProviderName()}`);
      }

      // Generate Schema.org JSON-LD
      const result = await llmAdapter.generateSchemaFromHtml(
        job.htmlContent || '',
        job.url
      );

      const processingTime = Date.now() - startTime;

      // Update job with results
      await storage.updateAnalysisJob(jobId, {
        status: 'completed',
        generatedJsonLd: result.jsonLd,
        processingTime,
      });

      // Update domain statistics
      const domain = await storage.getDomain(job.domainId);
      if (domain) {
        await storage.updateDomain(domain.id, {
          pagesAnalyzed: (domain.pagesAnalyzed || 0) + 1,
          lastAnalyzed: new Date(),
        });
      }

      // Store in Cloudflare KV (if configured)
      await this.storeInCloudflareKV(job.url, result.jsonLd);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Update job with error
      await storage.updateAnalysisJob(jobId, {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        processingTime,
        retryCount: (await storage.getAnalysisJob(jobId))?.retryCount || 0 + 1,
      });

      // Determine if job should be retried
      const updatedJob = await storage.getAnalysisJob(jobId);
      if (updatedJob && updatedJob.retryCount < 3) {
        // Schedule retry (in a real implementation, this would use a message queue)
        setTimeout(() => {
          this.processAnalysisJob(jobId);
        }, Math.pow(2, updatedJob.retryCount) * 1000); // Exponential backoff
      }

      throw error;
    }
  }

  private async storeInCloudflareKV(url: string, jsonLd: any): Promise<void> {
    // This would integrate with Cloudflare KV API
    // For now, we'll just log it
    console.log(`Storing JSON-LD for ${url}:`, JSON.stringify(jsonLd, null, 2));
  }

  async getJobStats(domainId: number): Promise<{
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    averageProcessingTime: number;
  }> {
    const jobs = await storage.getAnalysisJobsByDomain(domainId);
    
    const stats = {
      total: jobs.length,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      averageProcessingTime: 0,
    };

    let totalProcessingTime = 0;
    let completedJobs = 0;

    for (const job of jobs) {
      stats[job.status as keyof typeof stats]++;
      
      if (job.status === 'completed' && job.processingTime) {
        totalProcessingTime += job.processingTime;
        completedJobs++;
      }
    }

    if (completedJobs > 0) {
      stats.averageProcessingTime = Math.round(totalProcessingTime / completedJobs);
    }

    return stats;
  }
}
