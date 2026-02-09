import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const audits = pgTable("audits", {
  id: serial("id").primaryKey(),
  targetUrl: text("target_url").notNull(),
  status: text("status").notNull().default("pending"),
  screenshotUrl: text("screenshot_url"),
  reasoningLog: text("reasoning_log"),
  totalFindings: integer("total_findings").default(0),
  criticalCount: integer("critical_count").default(0),
  majorCount: integer("major_count").default(0),
  minorCount: integer("minor_count").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const ghostSessions = pgTable("ghost_sessions", {
  id: serial("id").primaryKey(),
  auditId: integer("audit_id").notNull().references(() => audits.id, { onDelete: "cascade" }),
  persona: text("persona").notNull(),
  personaDescription: text("persona_description"),
  personaIcon: text("persona_icon"),
  status: text("status").notNull().default("pending"),
  findingsCount: integer("findings_count").default(0),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const findings = pgTable("findings", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => ghostSessions.id, { onDelete: "cascade" }),
  auditId: integer("audit_id").notNull().references(() => audits.id, { onDelete: "cascade" }),
  elementLocationX: integer("element_location_x"),
  elementLocationY: integer("element_location_y"),
  severity: text("severity").notNull(),
  category: text("category").notNull(),
  impactDescription: text("impact_description").notNull(),
  elementSelector: text("element_selector"),
  wcagCriteria: text("wcag_criteria"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const remediations = pgTable("remediations", {
  id: serial("id").primaryKey(),
  findingId: integer("finding_id").notNull().references(() => findings.id, { onDelete: "cascade" }),
  codeSnippet: text("code_snippet").notNull(),
  language: text("language").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertAuditSchema = createInsertSchema(audits).omit({
  id: true,
  createdAt: true,
  totalFindings: true,
  criticalCount: true,
  majorCount: true,
  minorCount: true,
  status: true,
  screenshotUrl: true,
  reasoningLog: true,
});

export const insertGhostSessionSchema = createInsertSchema(ghostSessions).omit({
  id: true,
  createdAt: true,
  status: true,
  findingsCount: true,
});

export const insertFindingSchema = createInsertSchema(findings).omit({
  id: true,
  createdAt: true,
});

export const insertRemediationSchema = createInsertSchema(remediations).omit({
  id: true,
  createdAt: true,
});

export type Audit = typeof audits.$inferSelect;
export type InsertAudit = z.infer<typeof insertAuditSchema>;
export type GhostSession = typeof ghostSessions.$inferSelect;
export type InsertGhostSession = z.infer<typeof insertGhostSessionSchema>;
export type Finding = typeof findings.$inferSelect;
export type InsertFinding = z.infer<typeof insertFindingSchema>;
export type Remediation = typeof remediations.$inferSelect;
export type InsertRemediation = z.infer<typeof insertRemediationSchema>;
