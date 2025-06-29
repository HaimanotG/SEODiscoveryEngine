export const config = {
  // Database
  databaseUrl: process.env.DATABASE_URL || "",
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || "fallback-secret-key",
  sessionSecret: process.env.SESSION_SECRET || "fallback-session-secret",
  
  // Cloudflare OAuth
  cloudflare: {
    clientId: process.env.CLOUDFLARE_CLIENT_ID || "",
    clientSecret: process.env.CLOUDFLARE_CLIENT_SECRET || "",
    redirectUri: process.env.CLOUDFLARE_REDIRECT_URI || `${process.env.REPLIT_DOMAINS?.split(',')[0] || 'localhost:5000'}/oauth/cloudflare/callback`,
    apiBaseUrl: "https://api.cloudflare.com/client/v4",
    oauthBaseUrl: "https://dash.cloudflare.com/oauth2",
  },
  
  // LLM Providers
  llm: {
    provider: process.env.LLM_PROVIDER || "gemini", // openai, gemini
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      model: process.env.OPENAI_MODEL || "gpt-4o",
    },
    gemini: {
      apiKey: process.env.GEMINI_API_KEY || "",
      model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    },
  },
  
  // Message Queue
  redis: {
    url: process.env.REDIS_URL || "",
  },
  
  // Worker
  worker: {
    apiKey: process.env.WORKER_API_KEY || "default-worker-key",
  },
  
  // Environment
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
};
