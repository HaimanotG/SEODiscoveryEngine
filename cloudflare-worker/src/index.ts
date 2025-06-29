// SEO Discoverly - Cloudflare Worker
// This worker intercepts requests, checks for cached JSON-LD data in KV store,
// and injects it into HTML responses while triggering background analysis for cache misses

interface Env {
  SEO_CACHE: KVNamespace;
  BACKEND_API_URL: string;
  API_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);
      
      // Only process GET requests for HTML pages
      if (request.method !== 'GET') {
        return fetch(request);
      }

      // Skip processing for assets, API endpoints, etc.
      if (this.shouldSkipProcessing(url.pathname)) {
        return fetch(request);
      }

      const cacheKey = url.toString();
      
      // Check KV store for existing JSON-LD
      const cachedJsonLd = await env.SEO_CACHE.get(cacheKey);
      
      if (cachedJsonLd) {
        // Cache hit - inject existing data
        const response = await fetch(request);
        
        if (this.isHtmlResponse(response)) {
          return this.injectJsonLd(response, JSON.parse(cachedJsonLd));
        }
        
        return response;
      } else {
        // Cache miss - fetch original and trigger analysis
        const response = await fetch(request);
        
        if (this.isHtmlResponse(response)) {
          // Fire-and-forget analysis trigger
          ctx.waitUntil(this.triggerAnalysis(url.toString(), response.clone(), env));
        }
        
        // Return original response
        return response;
      }
    } catch (error) {
      // Always serve original content on error
      console.error('Worker error:', error);
      return fetch(request);
    }
  },

  shouldSkipProcessing(pathname: string): boolean {
    const skipPatterns = [
      /\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|pdf)$/i,
      /^\/api\//,
      /^\/admin\//,
      /^\/wp-admin\//,
      /^\/wp-content\//,
    ];
    
    return skipPatterns.some(pattern => pattern.test(pathname));
  },

  isHtmlResponse(response: Response): boolean {
    const contentType = response.headers.get('content-type') || '';
    return contentType.includes('text/html');
  },

  async injectJsonLd(response: Response, jsonLd: any): Promise<Response> {
    const rewriter = new HTMLRewriter()
      .on('head', {
        element(element) {
          const script = `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
          element.append(script, { html: true });
        }
      });
    
    return rewriter.transform(response);
  },

  async triggerAnalysis(url: string, response: Response, env: Env): Promise<void> {
    try {
      const html = await response.text();
      
      const payload = {
        url,
        htmlContent: html,
      };

      const analysisResponse = await fetch(`${env.BACKEND_API_URL}/api/v1/jobs/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': env.API_KEY,
        },
        body: JSON.stringify(payload),
      });

      if (!analysisResponse.ok) {
        console.error(`Analysis trigger failed: ${analysisResponse.status} ${analysisResponse.statusText}`);
      }
    } catch (error) {
      // Silently fail - don't impact user experience
      console.error('Analysis trigger failed:', error);
    }
  },
};
