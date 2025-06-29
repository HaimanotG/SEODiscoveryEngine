import { AnalysisService } from "../services/analysisService.js";
import { storage } from "../storage.js";

// Simple in-memory queue implementation
// In production, use Redis Bull Queue or similar
class SimpleQueue {
  private queue: number[] = [];
  private processing = false;

  async add(jobId: number): Promise<void> {
    this.queue.push(jobId);
    this.processNext();
  }

  private async processNext(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    const jobId = this.queue.shift();
    
    if (jobId) {
      const analysisService = new AnalysisService();
      try {
        await analysisService.processAnalysisJob(jobId);
        console.log(`✓ Analysis job ${jobId} completed successfully`);
      } catch (error) {
        console.error(`✗ Analysis job ${jobId} failed:`, error);
      }
    }

    this.processing = false;
    
    // Process next job if any
    if (this.queue.length > 0) {
      setTimeout(() => this.processNext(), 100);
    }
  }
}

export const analysisQueue = new SimpleQueue();

// Background worker that processes failed jobs for retry
export function startBackgroundWorker(): void {
  setInterval(async () => {
    try {
      // Find failed jobs that can be retried
      const failedJobs = await storage.getRetryableJobs();
      
      for (const job of failedJobs) {
        await analysisQueue.add(job.id);
      }
    } catch (error) {
      console.error('Background worker error:', error);
    }
  }, 60000); // Check every minute
}
