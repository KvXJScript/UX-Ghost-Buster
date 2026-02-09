import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";

const ai = new GoogleGenAI({
  apiKey: process.env.AI_INTEGRATIONS_GEMINI_API_KEY,
  httpOptions: {
    apiVersion: "",
    baseUrl: process.env.AI_INTEGRATIONS_GEMINI_BASE_URL,
  },
});

interface GeminiFinding {
  severity: "critical" | "major" | "minor";
  category: string;
  impactDescription: string;
  elementSelector?: string;
  elementLocationX?: number;
  elementLocationY?: number;
  wcagCriteria?: string;
  remediation?: {
    description: string;
    codeSnippet: string;
    language: string;
  };
}

interface GeminiAnalysis {
  thoughtSignature: string;
  findings: GeminiFinding[];
}

export async function processAudit(auditId: number) {
  const audit = await storage.getAudit(auditId);
  if (!audit) throw new Error("Audit not found");

  const sessions = await storage.getSessionsByAudit(auditId);
  let allReasoningLogs: string[] = [];
  let totalCritical = 0;
  let totalMajor = 0;
  let totalMinor = 0;
  let totalFindings = 0;

  for (const session of sessions) {
    try {
      await storage.updateSession(session.id, { status: "analyzing" });

      const analysis = await analyzeForPersonaStreaming(audit.targetUrl, session.persona, session.personaDescription || "");

      if (analysis.thoughtSignature) {
        allReasoningLogs.push(`[${session.persona}]\n${analysis.thoughtSignature}`);
      }

      let sessionCritical = 0;
      let sessionMajor = 0;
      let sessionMinor = 0;

      for (const f of analysis.findings) {
        const finding = await storage.createFinding({
          sessionId: session.id,
          auditId: auditId,
          elementLocationX: f.elementLocationX || null,
          elementLocationY: f.elementLocationY || null,
          severity: f.severity,
          category: f.category,
          impactDescription: f.impactDescription,
          elementSelector: f.elementSelector || null,
          wcagCriteria: f.wcagCriteria || null,
        });

        if (f.severity === "critical") sessionCritical++;
        else if (f.severity === "major") sessionMajor++;
        else sessionMinor++;

        if (f.remediation) {
          await storage.createRemediation({
            findingId: finding.id,
            codeSnippet: f.remediation.codeSnippet,
            language: f.remediation.language,
            description: f.remediation.description,
          });
        }
      }

      totalCritical += sessionCritical;
      totalMajor += sessionMajor;
      totalMinor += sessionMinor;
      totalFindings += analysis.findings.length;

      await storage.updateSession(session.id, {
        status: "completed",
        findingsCount: analysis.findings.length,
      });

    } catch (error) {
      console.error(`Error analyzing session ${session.id}:`, error);
      await storage.updateSession(session.id, { status: "completed", findingsCount: 0 });
    }
  }

  await storage.updateAudit(auditId, {
    status: "completed",
    reasoningLog: allReasoningLogs.join("\n\n---\n\n"),
    totalFindings,
    criticalCount: totalCritical,
    majorCount: totalMajor,
    minorCount: totalMinor,
  });
}

async function analyzeForPersonaStreaming(
  targetUrl: string,
  persona: string,
  personaDescription: string
): Promise<GeminiAnalysis> {
  const prompt = `You are a UX accessibility auditor acting as "${persona}" — ${personaDescription}.

Analyze the website at URL: ${targetUrl}

Imagine you are visiting this website as this persona. Think through the entire user journey from landing to completing the primary action.

First, write your "Thought Signature" — your internal reasoning about what issues this persona would encounter. Consider:
- Navigation patterns and pain points
- Visual accessibility issues
- Interaction barriers
- Content comprehension challenges
- Device/input-specific problems

Then provide a JSON analysis of UX issues found. For each finding include:
- severity: "critical", "major", or "minor"
- category: one of "Navigation", "Visual", "Interaction", "Content", "Performance", "Accessibility"
- impactDescription: a clear description of the issue and its impact on this user persona
- elementSelector: CSS selector for the problematic element if applicable
- elementLocationX: estimated X coordinate (0-1280) on a typical viewport
- elementLocationY: estimated Y coordinate (0-900) on a typical viewport
- wcagCriteria: relevant WCAG criteria if applicable (e.g., "2.1.1 Keyboard")
- remediation: an object with description, codeSnippet (CSS or TSX fix), and language ("css" or "tsx")

Respond in this exact JSON format:
{
  "thoughtSignature": "Your reasoning here...",
  "findings": [
    {
      "severity": "critical",
      "category": "Navigation",
      "impactDescription": "...",
      "elementSelector": "...",
      "elementLocationX": 640,
      "elementLocationY": 300,
      "wcagCriteria": "2.1.1",
      "remediation": {
        "description": "...",
        "codeSnippet": "...",
        "language": "css"
      }
    }
  ]
}

Generate 2-5 realistic, insightful findings specific to this persona. Be detailed and practical.`;

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        maxOutputTokens: 8192,
      },
    });

    let fullText = "";
    for await (const chunk of stream) {
      const content = chunk.text || "";
      if (content) {
        fullText += content;
      }
    }

    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return {
        thoughtSignature: fullText.substring(0, 500),
        findings: [],
      };
    }

    const parsed: GeminiAnalysis = JSON.parse(jsonMatch[0]);
    return parsed;
  } catch (error) {
    console.error(`Gemini streaming analysis error for ${persona}:`, error);
    return {
      thoughtSignature: `Analysis attempted for ${persona} on ${targetUrl}. An error occurred during processing.`,
      findings: [],
    };
  }
}
