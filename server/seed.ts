import { storage } from "./storage";
import { db } from "./db";
import { audits } from "@shared/schema";

export async function seedDatabase() {
  const existingAudits = await storage.getAllAudits();
  if (existingAudits.length > 0) return;

  console.log("Seeding database with sample audits...");

  const audit1 = await storage.createAudit({ targetUrl: "https://github.com" });
  const s1a = await storage.createGhostSession({
    auditId: audit1.id,
    persona: "The Keyboard-Only User",
    personaDescription: "Navigates entirely by keyboard, no mouse or trackpad usage",
    personaIcon: "keyboard",
  });
  const s1b = await storage.createGhostSession({
    auditId: audit1.id,
    persona: "The Low-Vision User",
    personaDescription: "Uses screen magnification, needs high contrast and large targets",
    personaIcon: "eye",
  });

  const f1 = await storage.createFinding({
    sessionId: s1a.id,
    auditId: audit1.id,
    elementLocationX: 200,
    elementLocationY: 60,
    severity: "critical",
    category: "Navigation",
    impactDescription: "Skip navigation link is present but not visible on focus, making it impossible for keyboard users to bypass repetitive navigation menus efficiently.",
    elementSelector: "a.skip-to-content",
    wcagCriteria: "2.4.1 Bypass Blocks",
  });
  await storage.createRemediation({
    findingId: f1.id,
    codeSnippet: `.skip-to-content:focus {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 9999;\n  padding: 1rem 2rem;\n  background: #0d1117;\n  color: #58a6ff;\n  font-size: 1rem;\n  outline: 2px solid #58a6ff;\n}`,
    language: "css",
    description: "Make the skip navigation link visible when focused via keyboard tab",
  });

  const f2 = await storage.createFinding({
    sessionId: s1a.id,
    auditId: audit1.id,
    elementLocationX: 900,
    elementLocationY: 400,
    severity: "major",
    category: "Interaction",
    impactDescription: "Dropdown menus in repository file explorer do not trap focus, allowing keyboard users to tab behind the overlay into hidden elements.",
    elementSelector: ".dropdown-menu",
    wcagCriteria: "2.1.2 No Keyboard Trap",
  });
  await storage.createRemediation({
    findingId: f2.id,
    codeSnippet: `<Dialog\n  onKeyDown={(e) => {\n    if (e.key === 'Escape') closeMenu();\n    if (e.key === 'Tab') {\n      trapFocus(e, menuRef.current);\n    }\n  }}\n>\n  {/* menu items */}\n</Dialog>`,
    language: "tsx",
    description: "Implement focus trapping within dropdown menus to prevent keyboard users from tabbing outside",
  });

  const f3 = await storage.createFinding({
    sessionId: s1b.id,
    auditId: audit1.id,
    elementLocationX: 640,
    elementLocationY: 120,
    severity: "major",
    category: "Visual",
    impactDescription: "Repository description text uses a light gray (#8b949e) on dark background (#0d1117), falling below the WCAG AA contrast ratio of 4.5:1 for normal text.",
    elementSelector: ".repo-description",
    wcagCriteria: "1.4.3 Contrast (Minimum)",
  });
  await storage.createRemediation({
    findingId: f3.id,
    codeSnippet: `.repo-description {\n  color: #c9d1d9; /* 7.2:1 contrast ratio */\n}`,
    language: "css",
    description: "Increase text color contrast to meet WCAG AA minimum requirements",
  });

  const f4 = await storage.createFinding({
    sessionId: s1b.id,
    auditId: audit1.id,
    elementLocationX: 50,
    elementLocationY: 300,
    severity: "minor",
    category: "Visual",
    impactDescription: "Small icons in the sidebar navigation lack sufficient padding, making them difficult targets for users with low dexterity or those using magnification.",
    elementSelector: ".sidebar-nav-icon",
    wcagCriteria: "2.5.5 Target Size",
  });
  await storage.createRemediation({
    findingId: f4.id,
    codeSnippet: `.sidebar-nav-icon {\n  min-width: 44px;\n  min-height: 44px;\n  padding: 10px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}`,
    language: "css",
    description: "Increase touch/click target size to minimum 44x44px per WCAG 2.5.5",
  });

  await storage.updateSession(s1a.id, { status: "completed", findingsCount: 2 });
  await storage.updateSession(s1b.id, { status: "completed", findingsCount: 2 });
  await storage.updateAudit(audit1.id, {
    status: "completed",
    totalFindings: 4,
    criticalCount: 1,
    majorCount: 2,
    minorCount: 1,
    reasoningLog: `[The Keyboard-Only User]\nAs a keyboard-only user visiting GitHub, my primary concern is whether I can navigate the entire interface without a mouse. The site has extensive navigation menus, nested dropdowns, and interactive elements like code editors. I need to verify that focus indicators are visible, tab order is logical, and interactive elements are reachable. Key concerns: skip navigation functionality, focus management in modals and dropdowns, and keyboard shortcuts that might conflict with screen reader commands.\n\n---\n\n[The Low-Vision User]\nApproaching GitHub with low vision, I'm immediately checking contrast ratios across the interface. The dark theme can be challenging if text colors don't meet minimum contrast requirements. I need to ensure that interactive elements are large enough to target, that information isn't conveyed solely through color, and that the interface remains usable at 200% zoom. My key focus areas are text readability, icon sizes, and whether visual groupings are clear enough at magnified views.`,
  });

  const audit2 = await storage.createAudit({ targetUrl: "https://stackoverflow.com" });
  const s2a = await storage.createGhostSession({
    auditId: audit2.id,
    persona: "The Distracted Parent",
    personaDescription: "Multitasking with children, limited attention span, frequent interruptions",
    personaIcon: "baby",
  });
  const s2b = await storage.createGhostSession({
    auditId: audit2.id,
    persona: "The Mobile Commuter",
    personaDescription: "On shaky public transit, one-handed usage, poor connectivity",
    personaIcon: "smartphone",
  });

  const f5 = await storage.createFinding({
    sessionId: s2a.id,
    auditId: audit2.id,
    elementLocationX: 640,
    elementLocationY: 200,
    severity: "critical",
    category: "Content",
    impactDescription: "Long code snippets in answers lack a copy-to-clipboard button, forcing distracted users to carefully select and copy code — a multi-step process easily interrupted.",
    elementSelector: "pre code",
    wcagCriteria: null,
  });
  await storage.createRemediation({
    findingId: f5.id,
    codeSnippet: `<div className="relative group">\n  <pre><code>{codeContent}</code></pre>\n  <Button\n    size="icon"\n    variant="ghost"\n    className="absolute top-2 right-2"\n    onClick={() => navigator.clipboard.writeText(codeContent)}\n  >\n    <Copy className="w-4 h-4" />\n  </Button>\n</div>`,
    language: "tsx",
    description: "Add a one-click copy button to all code blocks for quick code copying",
  });

  const f6 = await storage.createFinding({
    sessionId: s2a.id,
    auditId: audit2.id,
    elementLocationX: 300,
    elementLocationY: 500,
    severity: "major",
    category: "Navigation",
    impactDescription: "No bookmark or save-for-later feature is immediately visible. A distracted parent who finds a useful answer may lose it when interrupted and unable to return easily.",
    elementSelector: ".post-actions",
    wcagCriteria: null,
  });

  const f7 = await storage.createFinding({
    sessionId: s2b.id,
    auditId: audit2.id,
    elementLocationX: 640,
    elementLocationY: 80,
    severity: "major",
    category: "Performance",
    impactDescription: "The search results page loads multiple large JavaScript bundles, causing significant delay on slow mobile connections. Users on transit may abandon before results appear.",
    elementSelector: null,
    wcagCriteria: null,
  });
  await storage.createRemediation({
    findingId: f7.id,
    codeSnippet: `// Implement code splitting for search results\nconst SearchResults = lazy(() => import('./SearchResults'));\n\n// Add loading skeleton\n<Suspense fallback={<SearchSkeleton />}>\n  <SearchResults query={query} />\n</Suspense>`,
    language: "tsx",
    description: "Implement lazy loading and code splitting for the search results page to reduce initial bundle size",
  });

  const f8 = await storage.createFinding({
    sessionId: s2b.id,
    auditId: audit2.id,
    elementLocationX: 50,
    elementLocationY: 400,
    severity: "minor",
    category: "Interaction",
    impactDescription: "Vote buttons are small (24x24px) and close together, making one-handed operation on a moving train error-prone. Users may accidentally downvote instead of upvote.",
    elementSelector: ".js-vote-up-btn",
    wcagCriteria: "2.5.5 Target Size",
  });
  await storage.createRemediation({
    findingId: f8.id,
    codeSnippet: `.vote-btn {\n  min-width: 48px;\n  min-height: 48px;\n  margin: 4px 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}`,
    language: "css",
    description: "Increase vote button tap targets and add spacing between up and down vote buttons",
  });

  await storage.updateSession(s2a.id, { status: "completed", findingsCount: 2 });
  await storage.updateSession(s2b.id, { status: "completed", findingsCount: 2 });
  await storage.updateAudit(audit2.id, {
    status: "completed",
    totalFindings: 4,
    criticalCount: 1,
    majorCount: 2,
    minorCount: 1,
    reasoningLog: `[The Distracted Parent]\nAs a parent trying to find a code solution while managing children, I have approximately 30-second windows of focus. I need answers to be scannable, with clear visual hierarchy. My main pain points will be information density, lack of quick-action features, and any workflow that requires sustained attention. I'm likely to lose my place frequently and need to re-orient quickly.\n\n---\n\n[The Mobile Commuter]\nUsing Stack Overflow on a crowded train with one hand, I face challenges with small touch targets, heavy page loads on flaky connectivity, and horizontal scrolling on code blocks. I need the interface to be thumb-friendly, load incrementally, and not lose my scroll position when the connection drops.`,
  });

  const audit3 = await storage.createAudit({ targetUrl: "https://docs.google.com" });
  await storage.createGhostSession({
    auditId: audit3.id,
    persona: "The Screen Reader User",
    personaDescription: "Relies on ARIA labels, semantic HTML, and logical tab order",
    personaIcon: "accessibility",
  });
  await storage.createGhostSession({
    auditId: audit3.id,
    persona: "The Overwhelmed User",
    personaDescription: "Cognitive overload, unfamiliar with tech, needs clear guidance",
    personaIcon: "brain",
  });

  console.log("Seed data created successfully.");
}
