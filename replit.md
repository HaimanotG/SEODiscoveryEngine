# SEO Discoverly - AI-Powered SEO & Discoverability Platform

## Overview

SEO Discoverly is a full-stack, enterprise-grade, AI-integrated platform that makes websites fully visible and understandable to AI crawlers and traditional search engines. The system uses Cloudflare Workers to inject AI-generated JSON-LD structured data into web pages in real-time, improving SEO and discoverability.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture (Refactored to NestJS + DDD)
- **Framework**: NestJS with TypeScript (refactored from Express.js)
- **Architecture Pattern**: Domain-Driven Design (DDD) + Hexagonal Architecture + CQRS
- **Structure**:
  - **Presentation Layer** (`src/presentation/`): Controllers, DTOs, and HTTP handling
  - **Application Layer** (`src/application/`): Use cases, commands, queries, and handlers
  - **Domain Layer** (`src/domain/`): Pure business entities and logic
  - **Infrastructure Layer** (`src/infrastructure/`): Database, external services, repositories
- **Patterns**:
  - **CQRS**: Command Query Responsibility Segregation for scalable operations
  - **Hexagonal Architecture**: Ports and adapters for loose coupling
  - **Repository Pattern**: Database abstraction with proper interfaces
  - **Dependency Injection**: NestJS IoC container for modularity

### Database
- **ORM**: Drizzle ORM with PostgreSQL (configured for Neon)
- **Schema**: Well-defined tables for users, domains, analysis jobs, and LLM providers
- **Migrations**: Managed through drizzle-kit

## Key Components

### Authentication & OAuth
- **JWT-based authentication** with secure token management
- **Cloudflare OAuth2 integration** for seamless domain access
- **Encrypted credential storage** for sensitive API keys

### AI Integration (Adapter Pattern)
- **LLM Adapter Interface**: Generic interface for multiple AI providers
- **Gemini Adapter**: Google Gemini AI integration
- **OpenAI Adapter**: OpenAI GPT-4o integration
- **Configurable Provider Selection**: Easy switching between AI providers

### Cloudflare Worker
- **Real-time JSON-LD injection** into HTML responses
- **KV-based caching** for performance optimization
- **Background analysis triggering** for cache misses

### Analysis Pipeline
- **Queue-based processing** with retry mechanisms
- **Background worker** for processing analysis jobs
- **HTML content extraction** and AI-powered schema generation
- **Error handling and retry logic** for robustness

## Data Flow

1. **User Onboarding**: OAuth connection to Cloudflare account
2. **Domain Discovery**: Automatic detection of user's domains via Cloudflare API
3. **Worker Deployment**: Cloudflare Worker deployed to intercept domain traffic
4. **Real-time Processing**: 
   - Worker checks KV cache for existing JSON-LD
   - If cache miss, triggers background analysis
   - AI generates appropriate Schema.org markup
   - Results cached in KV store for future requests
5. **Dashboard Analytics**: Real-time monitoring of analysis jobs and performance

## External Dependencies

### Required Services
- **Neon PostgreSQL**: Primary database storage
- **Cloudflare API**: Domain management and worker deployment
- **AI Providers**: OpenAI or Google Gemini for content analysis

### Optional Services
- **Redis**: For advanced queue management (currently using in-memory queue)

## Deployment Strategy

### Development
- **Vite dev server** for frontend with HMR
- **tsx** for backend development with auto-reload
- **Environment-based configuration** for different stages

### Production
- **Static build** of React frontend served by Express
- **Bundled backend** using esbuild for Node.js deployment
- **Environment variables** for configuration management

### Database
- **Schema synchronization** via `drizzle-kit push`
- **Migration support** for schema versioning

## Changelog

- June 29, 2025. Initial setup
- June 29, 2025. Refactored server architecture to NestJS with Domain-Driven Design (DDD), Hexagonal Architecture, and CQRS patterns for improved scalability and maintainability

## User Preferences

Preferred communication style: Simple, everyday language.