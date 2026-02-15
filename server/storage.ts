import { eq, desc, inArray } from "drizzle-orm";
import { db } from "./db";
import {
  audits, ghostSessions, findings, remediations,
  type Audit, type InsertAudit,
  type GhostSession, type InsertGhostSession,
  type Finding, type InsertFinding,
  type Remediation, type InsertRemediation,
} from "@shared/schema";

export interface IStorage {
  createAudit(data: InsertAudit): Promise<Audit>;
  getAudit(id: number): Promise<Audit | undefined>;
  getAllAudits(): Promise<Audit[]>;
  updateAudit(id: number, data: Partial<Audit>): Promise<Audit>;
  deleteAudit(id: number): Promise<void>;

  createGhostSession(data: InsertGhostSession): Promise<GhostSession>;
  getSessionsByAudit(auditId: number): Promise<GhostSession[]>;
  updateSession(id: number, data: Partial<GhostSession>): Promise<GhostSession>;

  createFinding(data: InsertFinding): Promise<Finding>;
  getFindingsByAudit(auditId: number): Promise<Finding[]>;

  createRemediation(data: InsertRemediation): Promise<Remediation>;
  getRemediationsByAudit(auditId: number): Promise<Remediation[]>;
  getRemediationsByFindingIds(findingIds: number[]): Promise<Remediation[]>;
}

export class DatabaseStorage implements IStorage {
  async createAudit(data: InsertAudit): Promise<Audit> {
    const [audit] = await db.insert(audits).values(data).returning();
    return audit;
  }

  async getAudit(id: number): Promise<Audit | undefined> {
    const [audit] = await db.select().from(audits).where(eq(audits.id, id));
    return audit;
  }

  async getAllAudits(): Promise<Audit[]> {
    return db.select().from(audits).orderBy(desc(audits.createdAt));
  }

  async updateAudit(id: number, data: Partial<Audit>): Promise<Audit> {
    const [audit] = await db.update(audits).set(data).where(eq(audits.id, id)).returning();
    return audit;
  }

  async deleteAudit(id: number): Promise<void> {
    await db.delete(audits).where(eq(audits.id, id));
  }

  async createGhostSession(data: InsertGhostSession): Promise<GhostSession> {
    const [session] = await db.insert(ghostSessions).values(data).returning();
    return session;
  }

  async getSessionsByAudit(auditId: number): Promise<GhostSession[]> {
    return db.select().from(ghostSessions).where(eq(ghostSessions.auditId, auditId));
  }

  async updateSession(id: number, data: Partial<GhostSession>): Promise<GhostSession> {
    const [session] = await db.update(ghostSessions).set(data).where(eq(ghostSessions.id, id)).returning();
    return session;
  }

  async createFinding(data: InsertFinding): Promise<Finding> {
    const [finding] = await db.insert(findings).values(data).returning();
    return finding;
  }

  async getFindingsByAudit(auditId: number): Promise<Finding[]> {
    return db.select().from(findings).where(eq(findings.auditId, auditId));
  }

  async createRemediation(data: InsertRemediation): Promise<Remediation> {
    const [remediation] = await db.insert(remediations).values(data).returning();
    return remediation;
  }

  async getRemediationsByAudit(auditId: number): Promise<Remediation[]> {
    const auditFindings = await this.getFindingsByAudit(auditId);
    const findingIds = auditFindings.map((f) => f.id);
    if (findingIds.length === 0) return [];
    return db.select().from(remediations).where(inArray(remediations.findingId, findingIds));
  }

  async getRemediationsByFindingIds(findingIds: number[]): Promise<Remediation[]> {
    if (findingIds.length === 0) return [];
    return db.select().from(remediations).where(inArray(remediations.findingId, findingIds));
  }
}

export const storage = new DatabaseStorage();
