import { storage } from "../storage.js";
import { CloudflareService } from "./cloudflareService.js";
import { User, Domain } from "@shared/schema.js";
import crypto from "crypto";
import { config } from "../config/index.js";

export class OnboardingService {
  private cloudflareService: CloudflareService;
  private encryptionKey: string;

  constructor() {
    this.cloudflareService = new CloudflareService();
    this.encryptionKey = config.jwtSecret.slice(0, 32).padEnd(32, '0');
  }

  private encrypt(text: string): string {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decrypt(encryptedText: string): string {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  async handleOAuthCallback(code: string, userEmail: string, userName: string): Promise<{ user: User; domains: Domain[] }> {
    try {
      // Exchange code for tokens
      const tokens = await this.cloudflareService.exchangeCodeForTokens(code);
      
      // Encrypt sensitive data
      const encryptedCredentials = this.encrypt(JSON.stringify({
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + (tokens.expires_in * 1000),
      }));

      // Create or update user
      let user = await storage.getUserByEmail(userEmail);
      if (!user) {
        user = await storage.createUser({
          email: userEmail,
          name: userName,
          encryptedCredentials,
        });
      } else {
        user = await storage.updateUser(user.id, {
          encryptedCredentials,
        });
      }

      // Fetch and setup domains
      const zones = await this.cloudflareService.getUserZones(tokens.access_token);
      const domains: Domain[] = [];

      for (const zone of zones) {
        const existingDomain = await storage.getDomainByZoneId(zone.id);
        
        if (!existingDomain) {
          // Create worker route for new domains
          const workerScript = this.generateWorkerScript();
          const workerRouteId = await this.cloudflareService.createWorkerRoute(
            zone.id,
            `${zone.name}/*`,
            workerScript,
            tokens.access_token
          );

          const domain = await storage.createDomain({
            userId: user.id,
            name: zone.name,
            zoneId: zone.id,
            status: 'active',
            workerRouteId,
          });
          
          domains.push(domain);
        } else {
          domains.push(existingDomain);
        }
      }

      return { user, domains };
    } catch (error) {
      throw new Error(`Onboarding failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async disconnectUser(userId: number): Promise<void> {
    try {
      const user = await storage.getUser(userId);
      if (!user || !user.encryptedCredentials) {
        throw new Error('User not found or not connected');
      }

      const credentials = JSON.parse(this.decrypt(user.encryptedCredentials));
      
      // Revoke tokens
      await this.cloudflareService.revokeTokens(credentials.accessToken);
      
      // Clean up user data
      await storage.updateUser(userId, {
        encryptedCredentials: null,
      });
      
      // Mark domains as inactive
      const domains = await storage.getDomainsByUserId(userId);
      for (const domain of domains) {
        await storage.updateDomain(domain.id, {
          status: 'inactive',
        });
      }
    } catch (error) {
      throw new Error(`Disconnect failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private generateWorkerScript(): string {
    return `
// SEO Discoverly - Cloudflare Worker
const BACKEND_API_URL = "${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}";
const API_KEY = "${config.worker.apiKey}";

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  try {
    const url = new URL(request.url);
    const cacheKey = url.toString();
    
    // Check KV store for existing JSON-LD
    const cachedJsonLd = await SEO_CACHE.get(cacheKey);
    
    if (cachedJsonLd) {
      // Cache hit - inject existing data
      const response = await fetch(request);
      return injectJsonLd(response, JSON.parse(cachedJsonLd));
    } else {
      // Cache miss - fetch original and trigger analysis
      const response = await fetch(request);
      
      // Fire-and-forget analysis trigger
      triggerAnalysis(url.toString(), await response.clone().text());
      
      // Return original response
      return response;
    }
  } catch (error) {
    // Always serve original content on error
    return fetch(request);
  }
}

async function injectJsonLd(response, jsonLd) {
  const rewriter = new HTMLRewriter()
    .on('head', {
      element(element) {
        const script = \`<script type="application/ld+json">\${JSON.stringify(jsonLd)}</script>\`;
        element.append(script, { html: true });
      }
    });
  
  return rewriter.transform(response);
}

async function triggerAnalysis(url, html) {
  try {
    await fetch(\`\${BACKEND_API_URL}/api/v1/jobs/analyze\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify({ url, html }),
    });
  } catch (error) {
    // Silently fail - don't impact user experience
    console.error('Analysis trigger failed:', error);
  }
}
`;
  }

  getDecryptedCredentials(user: User): any {
    if (!user.encryptedCredentials) {
      throw new Error('No credentials found');
    }
    return JSON.parse(this.decrypt(user.encryptedCredentials));
  }
}
