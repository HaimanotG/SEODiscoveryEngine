import { users, domains, analysisJobs, type User, type InsertUser, type Domain, type InsertDomain, type AnalysisJob, type InsertAnalysisJob } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User>;

  // Domain operations
  getDomain(id: number): Promise<Domain | undefined>;
  getDomainByName(name: string): Promise<Domain | undefined>;
  getDomainByZoneId(zoneId: string): Promise<Domain | undefined>;
  getDomainsByUserId(userId: number): Promise<Domain[]>;
  createDomain(insertDomain: InsertDomain): Promise<Domain>;
  updateDomain(id: number, updates: Partial<InsertDomain>): Promise<Domain>;

  // Analysis job operations
  getAnalysisJob(id: number): Promise<AnalysisJob | undefined>;
  getAnalysisJobsByDomain(domainId: number): Promise<AnalysisJob[]>;
  getRecentAnalysisJobs(domainId: number, limit: number): Promise<AnalysisJob[]>;
  getRetryableJobs(): Promise<AnalysisJob[]>;
  createAnalysisJob(insertJob: InsertAnalysisJob): Promise<AnalysisJob>;
  updateAnalysisJob(id: number, updates: Partial<InsertAnalysisJob>): Promise<AnalysisJob>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Domain operations
  async getDomain(id: number): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.id, id));
    return domain || undefined;
  }

  async getDomainByName(name: string): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.name, name));
    return domain || undefined;
  }

  async getDomainByZoneId(zoneId: string): Promise<Domain | undefined> {
    const [domain] = await db.select().from(domains).where(eq(domains.zoneId, zoneId));
    return domain || undefined;
  }

  async getDomainsByUserId(userId: number): Promise<Domain[]> {
    return await db.select().from(domains).where(eq(domains.userId, userId));
  }

  async createDomain(insertDomain: InsertDomain): Promise<Domain> {
    const [domain] = await db
      .insert(domains)
      .values(insertDomain)
      .returning();
    return domain;
  }

  async updateDomain(id: number, updates: Partial<InsertDomain>): Promise<Domain> {
    const [domain] = await db
      .update(domains)
      .set(updates)
      .where(eq(domains.id, id))
      .returning();
    return domain;
  }

  // Analysis job operations
  async getAnalysisJob(id: number): Promise<AnalysisJob | undefined> {
    const [job] = await db.select().from(analysisJobs).where(eq(analysisJobs.id, id));
    return job || undefined;
  }

  async getAnalysisJobsByDomain(domainId: number): Promise<AnalysisJob[]> {
    return await db.select().from(analysisJobs).where(eq(analysisJobs.domainId, domainId));
  }

  async getRecentAnalysisJobs(domainId: number, limit: number): Promise<AnalysisJob[]> {
    return await db
      .select()
      .from(analysisJobs)
      .where(eq(analysisJobs.domainId, domainId))
      .orderBy(desc(analysisJobs.createdAt))
      .limit(limit);
  }

  async getRetryableJobs(): Promise<AnalysisJob[]> {
    return await db
      .select()
      .from(analysisJobs)
      .where(
        and(
          eq(analysisJobs.status, 'failed')
        )
      );
  }

  async createAnalysisJob(insertJob: InsertAnalysisJob): Promise<AnalysisJob> {
    const [job] = await db
      .insert(analysisJobs)
      .values(insertJob)
      .returning();
    return job;
  }

  async updateAnalysisJob(id: number, updates: Partial<InsertAnalysisJob>): Promise<AnalysisJob> {
    const [job] = await db
      .update(analysisJobs)
      .set(updates)
      .where(eq(analysisJobs.id, id))
      .returning();
    return job;
  }
}

export const storage = new DatabaseStorage();