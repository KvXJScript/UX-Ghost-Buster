import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processAudit } from "./audit-processor";
import { z } from "zod";

const createAuditSchema = z.object({
  targetUrl: z.string().url("Must be a valid URL"),
  personas: z.array(z.string()).min(1, "At least one persona required").optional(),
});

const PERSONA_MAP: Record<string, { name: string; description: string; icon: string }> = {
  "distracted-parent": {
    name: "The Distracted Parent",
    description: "Multitasking with children, limited attention span, frequent interruptions",
    icon: "baby",
  },
  "keyboard-only": {
    name: "The Keyboard-Only User",
    description: "Navigates entirely by keyboard, no mouse or trackpad usage",
    icon: "keyboard",
  },
  "low-vision": {
    name: "The Low-Vision User",
    description: "Uses screen magnification, needs high contrast and large targets",
    icon: "eye",
  },
  "mobile-commuter": {
    name: "The Mobile Commuter",
    description: "On shaky public transit, one-handed usage, poor connectivity",
    icon: "smartphone",
  },
  "cognitive-load": {
    name: "The Overwhelmed User",
    description: "Cognitive overload, unfamiliar with tech, needs clear guidance",
    icon: "brain",
  },
  "screen-reader": {
    name: "The Screen Reader User",
    description: "Relies on ARIA labels, semantic HTML, and logical tab order",
    icon: "accessibility",
  },
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/audits", async (_req, res) => {
    try {
      const audits = await storage.getAllAudits();
      res.json(audits);
    } catch (error) {
      console.error("Error fetching audits:", error);
      res.status(500).json({ error: "Failed to fetch audits" });
    }
  });

  app.get("/api/audits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid audit ID" });
      const audit = await storage.getAudit(id);
      if (!audit) return res.status(404).json({ error: "Audit not found" });
      res.json(audit);
    } catch (error) {
      console.error("Error fetching audit:", error);
      res.status(500).json({ error: "Failed to fetch audit" });
    }
  });

  app.get("/api/audits/:id/sessions", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid audit ID" });
      const sessions = await storage.getSessionsByAudit(id);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.get("/api/audits/:id/findings", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid audit ID" });
      const findingsList = await storage.getFindingsByAudit(id);
      res.json(findingsList);
    } catch (error) {
      console.error("Error fetching findings:", error);
      res.status(500).json({ error: "Failed to fetch findings" });
    }
  });

  app.get("/api/audits/:id/remediations", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid audit ID" });
      const remediationsList = await storage.getRemediationsByAudit(id);
      res.json(remediationsList);
    } catch (error) {
      console.error("Error fetching remediations:", error);
      res.status(500).json({ error: "Failed to fetch remediations" });
    }
  });

  app.delete("/api/audits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid audit ID" });
      const audit = await storage.getAudit(id);
      if (!audit) return res.status(404).json({ error: "Audit not found" });
      await storage.deleteAudit(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting audit:", error);
      res.status(500).json({ error: "Failed to delete audit" });
    }
  });

  app.get("/api/audits/:id/export", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: "Invalid audit ID" });
      const audit = await storage.getAudit(id);
      if (!audit) return res.status(404).json({ error: "Audit not found" });
      const sessions = await storage.getSessionsByAudit(id);
      const findingsList = await storage.getFindingsByAudit(id);
      const remediationsList = await storage.getRemediationsByAudit(id);
      res.json({
        audit,
        sessions,
        findings: findingsList,
        remediations: remediationsList,
        exportedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error exporting audit:", error);
      res.status(500).json({ error: "Failed to export audit" });
    }
  });

  app.post("/api/audits", async (req, res) => {
    try {
      const parsed = createAuditSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: parsed.error.errors[0].message });
      }

      const { targetUrl, personas } = parsed.data;

      const audit = await storage.createAudit({ targetUrl });

      const personaIds = personas || ["distracted-parent", "keyboard-only"];
      for (const personaId of personaIds) {
        const personaInfo = PERSONA_MAP[personaId] || {
          name: personaId,
          description: "",
          icon: "ghost",
        };
        await storage.createGhostSession({
          auditId: audit.id,
          persona: personaInfo.name,
          personaDescription: personaInfo.description,
          personaIcon: personaInfo.icon,
        });
      }

      await storage.updateAudit(audit.id, { status: "analyzing" });

      processAudit(audit.id).catch((err) => {
        console.error(`Error processing audit ${audit.id}:`, err);
        storage.updateAudit(audit.id, { status: "completed" });
      });

      const updatedAudit = await storage.getAudit(audit.id);
      res.status(201).json(updatedAudit);
    } catch (error) {
      console.error("Error creating audit:", error);
      res.status(500).json({ error: "Failed to create audit" });
    }
  });

  return httpServer;
}
