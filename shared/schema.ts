import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  cloudflareAccessToken: text("cloudflare_access_token"),
  cloudflareRefreshToken: text("cloudflare_refresh_token"),
  encryptedCredentials: text("encrypted_credentials"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const domains = pgTable("domains", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  zoneId: text("zone_id").notNull(),
  status: text("status").notNull().default("active"), // active, syncing, error
  workerRouteId: text("worker_route_id"),
  pagesAnalyzed: integer("pages_analyzed").default(0),
  lastAnalyzed: timestamp("last_analyzed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analysisJobs = pgTable("analysis_jobs", {
  id: serial("id").primaryKey(),
  domainId: integer("domain_id").notNull().references(() => domains.id),
  url: text("url").notNull(),
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  htmlContent: text("html_content"),
  generatedJsonLd: jsonb("generated_json_ld"),
  errorMessage: text("error_message"),
  processingTime: integer("processing_time"), // in milliseconds
  retryCount: integer("retry_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const llmProviders = pgTable("llm_providers", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  provider: text("provider").notNull(), // openai, gemini
  apiKey: text("api_key").notNull(),
  model: text("model").notNull(),
  isActive: boolean("is_active").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  domains: many(domains),
  llmProviders: many(llmProviders),
}));

export const domainsRelations = relations(domains, ({ one, many }) => ({
  user: one(users, {
    fields: [domains.userId],
    references: [users.id],
  }),
  analysisJobs: many(analysisJobs),
}));

export const analysisJobsRelations = relations(analysisJobs, ({ one }) => ({
  domain: one(domains, {
    fields: [analysisJobs.domainId],
    references: [domains.id],
  }),
}));

export const llmProvidersRelations = relations(llmProviders, ({ one }) => ({
  user: one(users, {
    fields: [llmProviders.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDomainSchema = createInsertSchema(domains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAnalysisJobSchema = createInsertSchema(analysisJobs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLlmProviderSchema = createInsertSchema(llmProviders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDomain = z.infer<typeof insertDomainSchema>;
export type Domain = typeof domains.$inferSelect;

export type InsertAnalysisJob = z.infer<typeof insertAnalysisJobSchema>;
export type AnalysisJob = typeof analysisJobs.$inferSelect;

export type InsertLlmProvider = z.infer<typeof insertLlmProviderSchema>;
export type LlmProvider = typeof llmProviders.$inferSelect;
