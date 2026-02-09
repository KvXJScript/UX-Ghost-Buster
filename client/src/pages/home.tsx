import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Ghost, ArrowRight, Shield, Brain, Code2, Eye, Keyboard,
  Smartphone, Baby, Accessibility, Zap, Target, FileCode,
  ChevronDown, ChevronUp, Search, BarChart3, Layers, Users,
  CheckCircle2, AlertTriangle, Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left hover-elevate rounded-md px-3"
        data-testid={`button-faq-${question.slice(0, 20).replace(/\s/g, "-").toLowerCase()}`}
      >
        <span className="text-sm font-medium">{question}</span>
        {open ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="overflow-hidden"
        >
          <p className="text-sm text-muted-foreground pb-4 px-3 leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </div>
  );
}

const personas = [
  { icon: Baby, name: "The Distracted Parent", desc: "Multitasking with children, limited focus, frequent interruptions", color: "text-pink-500 dark:text-pink-400" },
  { icon: Keyboard, name: "The Keyboard-Only User", desc: "Navigates entirely via keyboard, relies on focus indicators and tab order", color: "text-blue-500 dark:text-blue-400" },
  { icon: Eye, name: "The Low-Vision User", desc: "Needs magnification, high contrast, and large click targets", color: "text-purple-500 dark:text-purple-400" },
  { icon: Smartphone, name: "The Mobile Commuter", desc: "One-handed use on shaky transit, unreliable connection", color: "text-emerald-500 dark:text-emerald-400" },
  { icon: Brain, name: "The Overwhelmed User", desc: "Cognitive overload, unfamiliar with tech, needs clear guidance", color: "text-amber-500 dark:text-amber-400" },
  { icon: Accessibility, name: "The Screen Reader User", desc: "Relies on ARIA labels, semantic HTML, and logical structure", color: "text-cyan-500 dark:text-cyan-400" },
];

const features = [
  { icon: Search, title: "AI-Powered Analysis", desc: "Gemini AI examines your site through the lens of each persona, finding issues humans often miss." },
  { icon: Users, title: "Diverse Personas", desc: "Six distinct user archetypes that cover motor, visual, cognitive, and situational disabilities." },
  { icon: FileCode, title: "Remediation Code", desc: "Get ready-to-use CSS and TSX code snippets that fix each identified accessibility issue." },
  { icon: Brain, title: "Thought Signatures", desc: "Transparent AI reasoning logs show exactly how each issue was identified and prioritized." },
  { icon: BarChart3, title: "Severity Scoring", desc: "Issues ranked as Critical, Major, or Minor with WCAG criteria references for compliance tracking." },
  { icon: Layers, title: "Category Breakdown", desc: "Findings organized by Navigation, Visual, Interaction, Content, Performance, and Accessibility." },
];

const faqItems = [
  { q: "What is a Ghost Audit?", a: "A Ghost Audit simulates real users visiting your website. Each 'ghost' is an AI persona representing a specific user type — like someone navigating only with a keyboard, or a parent multitasking with children. The AI identifies UX barriers that each persona would encounter." },
  { q: "How does the AI analysis work?", a: "We use Google's Gemini AI with streaming analysis. The AI receives your URL and a detailed persona description, then reasons through the entire user journey — from landing on the page to completing the primary action. It identifies specific elements, provides CSS selectors, and generates fix code." },
  { q: "What are Thought Signatures?", a: "Thought Signatures are the AI's reasoning logs — a transparent record of how the AI identified each issue. They show the AI's thought process, helping you understand not just what's wrong, but why it matters for that specific user type." },
  { q: "Does this replace manual accessibility testing?", a: "No. Ghost Audits complement manual testing by providing rapid, persona-driven insights. We recommend using these results alongside manual testing with real users, WAVE tools, and screen reader testing for comprehensive coverage." },
  { q: "What WCAG criteria are covered?", a: "The AI references WCAG 2.1 guidelines including keyboard accessibility (2.1.1), focus visible (2.4.7), contrast ratios (1.4.3), text resize (1.4.4), target size (2.5.5), and many more. Each finding links to the specific WCAG success criterion it relates to." },
  { q: "How accurate are the AI findings?", a: "AI-generated findings are directional and highly useful for identifying patterns, but should be verified. The AI excels at catching common patterns like missing focus states, poor contrast, small touch targets, and unclear navigation — issues that are frequently confirmed by manual review." },
];

const additionalQuestions = [
  { q: "Can I audit any website?", a: "Yes, you can audit any publicly accessible URL. The AI analyzes the site's HTML structure, common UI patterns, and accessibility features based on the URL you provide." },
  { q: "How long does an audit take?", a: "Most audits complete within 30-60 seconds. The time depends on how many personas you select — each persona runs a separate AI analysis pass. You can monitor progress in real-time on the audit detail page." },
  { q: "What types of code fixes are generated?", a: "Remediation code comes in two formats: CSS fixes for styling issues (contrast, sizing, spacing, focus indicators) and TSX/React component fixes for structural issues (ARIA attributes, semantic HTML, keyboard handlers)." },
  { q: "Is my data stored securely?", a: "All audit data is stored in a PostgreSQL database. URLs and findings are kept for your reference. No screenshots or actual page content are stored — the AI analyzes sites in real-time during the audit." },
  { q: "Can I run multiple audits on the same site?", a: "Absolutely. Running multiple audits over time helps track accessibility improvements. Each audit captures a snapshot of issues, so you can compare results after implementing fixes." },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent dark:from-primary/10" />
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 dark:bg-primary/20 mb-6">
              <Ghost className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-primary">AI-Powered UX Accessibility Auditor</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 leading-tight" data-testid="text-hero-title">
              Find UX issues your users
              <span className="text-primary"> can't tell you about</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-8 leading-relaxed max-w-lg mx-auto">
              Ghost personas silently audit your website, uncovering accessibility barriers that real users face every day — then generate the code to fix them.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/new-audit">
                <Button size="lg" data-testid="button-hero-start-audit">
                  <Zap className="w-4 h-4 mr-2" />
                  Start a Ghost Audit
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" data-testid="button-hero-dashboard">
                  View Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2" data-testid="text-overview-title">How It Works</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Three steps to uncover hidden UX barriers on any website</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0 }}>
            <Card className="h-full">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="mb-2">Step 1</Badge>
                <h3 className="text-sm font-semibold mb-1">Enter a URL</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Paste any website URL and select which ghost personas should analyze it.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
            <Card className="h-full">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Ghost className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="mb-2">Step 2</Badge>
                <h3 className="text-sm font-semibold mb-1">Ghosts Analyze</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Each persona examines the site through their unique lens, finding issues specific to their abilities.</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <Card className="h-full">
              <CardContent className="p-5 text-center">
                <div className="w-10 h-10 rounded-md bg-primary/10 dark:bg-primary/20 flex items-center justify-center mx-auto mb-3">
                  <Code2 className="w-5 h-5 text-primary" />
                </div>
                <Badge variant="outline" className="mb-2">Step 3</Badge>
                <h3 className="text-sm font-semibold mb-1">Get Fixes</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Review findings with severity rankings, WCAG references, and ready-to-use remediation code.</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      <section className="bg-muted/30 dark:bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-2" data-testid="text-personas-title">Meet the Ghosts</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Six diverse personas that simulate real accessibility challenges</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {personas.map((p, i) => (
              <motion.div
                key={p.name}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-md bg-muted shrink-0 ${p.color}`}>
                        <p.icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold mb-0.5">{p.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight mb-2" data-testid="text-features-title">Features</h2>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">Everything you need for AI-driven accessibility auditing</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <f.icon className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">{f.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="bg-muted/30 dark:bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold tracking-tight mb-2" data-testid="text-whatyouget-title">What You Get After an Audit</h2>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">Comprehensive results designed to be actionable</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400" />
                  <h3 className="text-sm font-semibold">Severity-Ranked Findings</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">Every issue is classified as Critical, Major, or Minor based on its impact. Critical issues block core functionality, Major issues cause significant friction, and Minor issues reduce overall quality.</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="bg-red-600 dark:bg-red-500 text-white border-red-700 dark:border-red-400">Critical</Badge>
                  <Badge className="bg-amber-500 dark:bg-amber-400 text-white dark:text-black border-amber-600 dark:border-amber-300">Major</Badge>
                  <Badge variant="secondary">Minor</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileCode className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Ready-to-Use Code Fixes</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">Each finding includes remediation code in CSS or TSX format. Copy-paste the fix directly into your codebase, or use it as a starting point for your own implementation.</p>
                <div className="bg-muted rounded-md p-2">
                  <code className="text-[11px] font-mono text-muted-foreground">{`.btn:focus-visible { outline: 3px solid #7c3aed; }`}</code>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">Element-Level Precision</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Findings include CSS selectors pointing to the exact problematic element, plus estimated viewport coordinates. Know exactly where to look and what to fix.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold">WCAG Compliance Mapping</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">Each finding references the specific WCAG 2.1 success criterion it relates to, making it easy to prioritize fixes for compliance and track progress toward conformance levels.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2" data-testid="text-faq-title">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground mb-6">Everything you need to know about Ghost Audits</p>
            <Card>
              <CardContent className="p-2">
                {faqItems.map((item) => (
                  <FAQItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight mb-2" data-testid="text-additional-title">Additional Questions</h2>
            <p className="text-sm text-muted-foreground mb-6">More details about how it all works</p>
            <Card>
              <CardContent className="p-2">
                {additionalQuestions.map((item) => (
                  <FAQItem key={item.q} question={item.q} answer={item.a} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 dark:bg-muted/10">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold tracking-tight mb-2">Ready to Bust Some Ghosts?</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Start your first audit in under a minute. No setup required.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/new-audit">
                <Button size="lg" data-testid="button-cta-start-audit">
                  <Ghost className="w-4 h-4 mr-2" />
                  Start Free Audit
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline" size="lg" data-testid="button-cta-dashboard">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
          <div className="grid sm:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-md bg-primary">
                  <Ghost className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-bold text-sm">UX Ghost Buster</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                AI-powered accessibility auditing through the eyes of diverse user personas.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider text-muted-foreground">Navigate</h4>
              <div className="space-y-2">
                <Link href="/dashboard"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-dashboard">Dashboard</span></Link>
                <Link href="/new-audit"><span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer block" data-testid="link-footer-new-audit">New Audit</span></Link>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold mb-3 uppercase tracking-wider text-muted-foreground">About</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Built with Gemini AI, React, and PostgreSQL. Persona-driven analysis identifies real-world accessibility barriers.
              </p>
            </div>
          </div>
          <div className="border-t mt-6 pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              UX Ghost Buster — Making the web accessible, one ghost at a time.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
