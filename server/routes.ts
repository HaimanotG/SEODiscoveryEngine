import type { Express } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage.js";
import { OnboardingService } from "./services/onboardingService.js";
import { AnalysisService } from "./services/analysisService.js";
import { authenticateToken, authenticateWorker, AuthRequest } from "./middleware/auth.js";
import { analysisQueue, startBackgroundWorker } from "./workers/analysisWorker.js";
import { config } from "./config/index.js";
import { insertAnalysisJobSchema, type Domain } from "@shared/schema.js";

export async function registerRoutes(app: Express): Promise<Server> {
  const onboardingService = new OnboardingService();
  const analysisService = new AnalysisService();

  // Start background worker
  startBackgroundWorker();

  // OAuth Routes
  app.get("/api/auth/cloudflare", (req, res) => {
    const authUrl = `${config.cloudflare.oauthBaseUrl}/authorize?` +
      `client_id=${config.cloudflare.clientId}&` +
      `redirect_uri=${encodeURIComponent(config.cloudflare.redirectUri)}&` +
      `response_type=code&` +
      `scope=zone:read account:read`;
    
    res.redirect(authUrl);
  });

  app.post("/api/auth/cloudflare/callback", async (req, res) => {
    try {
      const { code, userEmail, userName } = req.body;
      
      if (!code || !userEmail || !userName) {
        return res.status(400).json({ 
          message: "Missing required fields: code, userEmail, userName" 
        });
      }

      const { user, domains } = await onboardingService.handleOAuthCallback(
        code,
        userEmail,
        userName
      );

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        config.jwtSecret,
        { expiresIn: "7d" }
      );

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        domains,
      });
    } catch (error) {
      console.error("OAuth callback error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "OAuth callback failed" 
      });
    }
  });

  app.post("/api/auth/disconnect", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      await onboardingService.disconnectUser(req.user.id);
      res.json({ message: "Successfully disconnected" });
    } catch (error) {
      console.error("Disconnect error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Disconnect failed" 
      });
    }
  });

  // User Routes
  app.get("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        isConnected: !!user.encryptedCredentials,
      });
    } catch (error) {
      console.error("Profile error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch profile" 
      });
    }
  });

  // Domain Routes
  app.get("/api/domains", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const domains = await storage.getDomainsByUserId(req.user.id);
      
      // Get stats for each domain
      const domainsWithStats = await Promise.all(
        domains.map(async (domain: Domain) => {
          const stats = await analysisService.getJobStats(domain.id);
          return {
            ...domain,
            stats,
          };
        })
      );

      res.json(domainsWithStats);
    } catch (error) {
      console.error("Domains error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch domains" 
      });
    }
  });

  app.get("/api/domains/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const domainId = parseInt(req.params.id);
      const domain = await storage.getDomain(domainId);
      
      if (!domain || domain.userId !== req.user.id) {
        return res.status(404).json({ message: "Domain not found" });
      }

      const stats = await analysisService.getJobStats(domain.id);
      const recentJobs = await storage.getRecentAnalysisJobs(domain.id, 10);

      res.json({
        ...domain,
        stats,
        recentJobs,
      });
    } catch (error) {
      console.error("Domain detail error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch domain" 
      });
    }
  });

  // Analysis Job Routes (called by Cloudflare Worker)
  app.post("/api/v1/jobs/analyze", authenticateWorker, async (req, res) => {
    try {
      const validatedData = insertAnalysisJobSchema.parse(req.body);
      
      const job = await analysisService.createAnalysisJob({
        url: validatedData.url,
        html: validatedData.htmlContent || '',
        domainId: validatedData.domainId,
      });

      // Add to processing queue
      await analysisQueue.add(job.id);

      res.status(202).json({
        jobId: job.id,
        status: "accepted",
        message: "Analysis job queued for processing",
      });
    } catch (error) {
      console.error("Analysis job creation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create analysis job" 
      });
    }
  });

  app.get("/api/jobs/:id", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const jobId = parseInt(req.params.id);
      const job = await storage.getAnalysisJob(jobId);
      
      if (!job) {
        return res.status(404).json({ message: "Job not found" });
      }

      // Verify user owns the domain
      const domain = await storage.getDomain(job.domainId);
      if (!domain || domain.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(job);
    } catch (error) {
      console.error("Job detail error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch job" 
      });
    }
  });

  // Analytics Routes
  app.get("/api/analytics/overview", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const domains = await storage.getDomainsByUserId(req.user.id);
      const totalDomains = domains.length;
      const activeDomains = domains.filter(d => d.status === 'active').length;
      
      let totalPages = 0;
      let totalJobs = 0;
      let completedJobs = 0;
      let totalProcessingTime = 0;

      for (const domain of domains) {
        totalPages += domain.pagesAnalyzed || 0;
        const stats = await analysisService.getJobStats(domain.id);
        totalJobs += stats.total;
        completedJobs += stats.completed;
        totalProcessingTime += stats.averageProcessingTime * stats.completed;
      }

      const successRate = totalJobs > 0 ? ((completedJobs / totalJobs) * 100).toFixed(1) : '0';
      const avgResponseTime = completedJobs > 0 ? Math.round(totalProcessingTime / completedJobs) : 0;

      res.json({
        activeDomains,
        pagesAnalyzed: totalPages,
        successRate: `${successRate}%`,
        avgResponseTime: `${avgResponseTime}ms`,
      });
    } catch (error) {
      console.error("Analytics overview error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch analytics" 
      });
    }
  });

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv,
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
