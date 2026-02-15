import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Ghost, AlertTriangle, AlertCircle, Info,
  CheckCircle2, Loader2, Clock, Code2, ExternalLink,
  Baby, Keyboard, Eye, Smartphone, Brain, Accessibility,
  ChevronRight, BarChart3, Layers, Shield, Target, Lightbulb,
  Copy, Check, Download, Trash2, RefreshCw, Search, X
} from "lucide-react";
import type { Audit, GhostSession, Finding, Remediation } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

const PERSONA_ICONS: Record<string, typeof Ghost> = {
  "distracted-parent": Baby,
  "keyboard-only": Keyboard,
  "low-vision": Eye,
  "mobile-commuter": Smartphone,
  "cognitive-load": Brain,
  "screen-reader": Accessibility,
};

const PERSONA_COLORS: Record<string, string> = {
  "distracted-parent": "text-pink-500 dark:text-pink-400",
  "keyboard-only": "text-blue-500 dark:text-blue-400",
  "low-vision": "text-purple-500 dark:text-purple-400",
  "mobile-commuter": "text-emerald-500 dark:text-emerald-400",
  "cognitive-load": "text-amber-500 dark:text-amber-400",
  "screen-reader": "text-cyan-500 dark:text-cyan-400",
};

const PERSONA_ID_MAP: Record<string, string> = {
  "distracted-parent": "distracted-parent",
  "keyboard-only-user": "keyboard-only",
  "low-vision-user": "low-vision",
  "mobile-commuter": "mobile-commuter",
  "overwhelmed-user": "cognitive-load",
  "screen-reader-user": "screen-reader",
};

function SeverityBadge({ severity }: { severity: string }) {
  switch (severity) {
    case "critical":
      return (
        <Badge className="bg-red-600 dark:bg-red-500 text-white border-red-700 dark:border-red-400">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Critical
        </Badge>
      );
    case "major":
      return (
        <Badge className="bg-amber-500 dark:bg-amber-400 text-white dark:text-black border-amber-600 dark:border-amber-300">
          <AlertCircle className="w-3 h-3 mr-1" />
          Major
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Info className="w-3 h-3 mr-1" />
          Minor
        </Badge>
      );
  }
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: "Copied to clipboard" });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  }, [text, toast]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className="shrink-0"
      data-testid="button-copy-code"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </Button>
  );
}

function FindingCard({ finding, remediations, index }: {
  finding: Finding;
  remediations: Remediation[];
  index: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const findingRemediations = remediations.filter((r) => r.findingId === finding.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`cursor-pointer transition-all duration-200 ${expanded ? "ring-1 ring-primary/30" : ""}`}
        onClick={() => setExpanded(!expanded)}
        data-testid={`card-finding-${finding.id}`}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <SeverityBadge severity={finding.severity} />
                <Badge variant="outline" className="text-xs">
                  {finding.category}
                </Badge>
                {finding.wcagCriteria && (
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {finding.wcagCriteria}
                  </span>
                )}
              </div>
              <p className="text-sm" data-testid={`text-finding-desc-${finding.id}`}>
                {finding.impactDescription}
              </p>
              {finding.elementSelector && (
                <code className="text-[11px] text-muted-foreground font-mono mt-1.5 block truncate">
                  {finding.elementSelector}
                </code>
              )}
            </div>
            <ChevronRight className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
          </div>

          <AnimatePresence>
            {expanded && findingRemediations.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mt-4 pt-3 border-t space-y-3">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-primary" />
                    <span className="text-xs font-medium">Remediation</span>
                  </div>
                  {findingRemediations.map((rem) => (
                    <div key={rem.id} className="space-y-2">
                      <p className="text-xs text-muted-foreground">{rem.description}</p>
                      <div className="relative">
                        <div className="absolute top-2 right-2 flex items-center gap-1">
                          <Badge variant="outline" className="text-[10px]">
                            {rem.language}
                          </Badge>
                          <CopyButton text={rem.codeSnippet} />
                        </div>
                        <pre className="bg-muted rounded-md p-3 pr-24 text-xs font-mono overflow-x-auto">
                          <code>{rem.codeSnippet}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function SessionPanel({ session, findings, remediations, severityFilter, searchQuery }: {
  session: GhostSession;
  findings: Finding[];
  remediations: Remediation[];
  severityFilter: string;
  searchQuery: string;
}) {
  let sessionFindings = findings.filter((f) => f.sessionId === session.id);

  if (severityFilter !== "all") {
    sessionFindings = sessionFindings.filter((f) => f.severity === severityFilter);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    sessionFindings = sessionFindings.filter((f) =>
      f.impactDescription.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q) ||
      (f.elementSelector && f.elementSelector.toLowerCase().includes(q)) ||
      (f.wcagCriteria && f.wcagCriteria.toLowerCase().includes(q))
    );
  }

  const personaKey = session.persona.toLowerCase().replace(/\s+/g, "-").replace(/^the-/, "");
  const Icon = PERSONA_ICONS[personaKey] || Ghost;
  const color = PERSONA_COLORS[personaKey] || "text-muted-foreground";

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className={`p-2 rounded-md bg-muted ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium">{session.persona}</h3>
          {session.personaDescription && (
            <p className="text-xs text-muted-foreground truncate">{session.personaDescription}</p>
          )}
        </div>
        <Badge variant="outline">{sessionFindings.length} findings</Badge>
      </div>

      {sessionFindings.length > 0 ? (
        <div className="space-y-2">
          {sessionFindings.map((finding, i) => (
            <FindingCard key={finding.id} finding={finding} remediations={remediations} index={i} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              {severityFilter !== "all" || searchQuery ? "No findings match your filters" : "No issues found for this persona"}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function AuditDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [severityFilter, setSeverityFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: audit, isLoading: auditLoading } = useQuery<Audit>({
    queryKey: ["/api/audits", id],
    refetchInterval: (query) => {
      const data = query.state.data as Audit | undefined;
      return data?.status === "completed" ? false : 3000;
    },
  });

  const { data: sessions } = useQuery<GhostSession[]>({
    queryKey: ["/api/audits", id, "sessions"],
    enabled: !!audit,
    refetchInterval: () => audit?.status === "completed" ? false : 3000,
  });

  const { data: allFindings } = useQuery<Finding[]>({
    queryKey: ["/api/audits", id, "findings"],
    enabled: !!audit,
    refetchInterval: () => audit?.status === "completed" ? false : 3000,
  });

  const { data: allRemediations } = useQuery<Remediation[]>({
    queryKey: ["/api/audits", id, "remediations"],
    enabled: !!audit && audit.status === "completed",
  });

  const deleteAudit = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/audits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Audit deleted" });
      navigate("/dashboard");
    },
    onError: () => {
      toast({ title: "Failed to delete audit", variant: "destructive" });
    },
  });

  const handleExport = useCallback(async () => {
    try {
      const res = await apiRequest("GET", `/api/audits/${id}/export`);
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ghost-audit-${id}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Report exported" });
    } catch {
      toast({ title: "Export failed", variant: "destructive" });
    }
  }, [id, toast]);

  const handleReaudit = useCallback(() => {
    if (!audit || !sessions) return;
    const personaIds = sessions.map((s) => {
      const key = s.persona.toLowerCase().replace(/\s+/g, "-").replace(/^the-/, "");
      return PERSONA_ID_MAP[key] || key;
    });
    const params = new URLSearchParams({
      url: audit.targetUrl,
      personas: personaIds.join(","),
    });
    navigate(`/new-audit?${params.toString()}`);
  }, [audit, sessions, navigate]);

  if (auditLoading) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-3 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      </div>
    );
  }

  if (!audit) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 text-center">
        <Ghost className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-lg font-medium mb-2">Audit not found</h2>
        <Link href="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
      </div>
    );
  }

  const urlDisplay = audit.targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");
  const isAnalyzing = audit.status === "analyzing" || audit.status === "pending";
  const totalSessions = sessions?.length || 0;
  const completedSessions = sessions?.filter((s) => s.status === "completed").length || 0;
  const progress = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 pb-12">
      <div className="flex items-start gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" data-testid="button-back-to-dash">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h1 className="text-xl font-bold tracking-tight truncate" data-testid="text-audit-detail-url">
              {urlDisplay}
            </h1>
            {audit.status === "completed" && (
              <Badge className="bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-700 dark:border-emerald-400">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Complete
              </Badge>
            )}
            {isAnalyzing && (
              <Badge className="bg-amber-500 dark:bg-amber-400 text-white dark:text-black border-amber-600 dark:border-amber-300">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Analyzing
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Started {new Date(audit.createdAt).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {audit.status === "completed" && (
            <>
              <Button variant="ghost" size="icon" onClick={handleReaudit} data-testid="button-reaudit">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleExport} data-testid="button-export">
                <Download className="w-4 h-4" />
              </Button>
            </>
          )}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" data-testid="button-delete-audit">
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this audit?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently remove the audit for {urlDisplay}, including all findings, remediations, and reasoning logs. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteAudit.mutate()}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  data-testid="button-confirm-delete"
                >
                  {deleteAudit.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {isAnalyzing && (
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Ghost analysis in progress...</p>
                <p className="text-xs text-muted-foreground">
                  {completedSessions}/{totalSessions} personas analyzed
                </p>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-500 dark:text-red-400" data-testid="text-critical-count">{audit.criticalCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-amber-500 dark:text-amber-400" data-testid="text-major-count">{audit.majorCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Major</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-400 dark:text-blue-300" data-testid="text-minor-count">{audit.minorCount || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Minor</p>
          </CardContent>
        </Card>
      </div>

      {audit.reasoningLog && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium">Thought Signatures</span>
            </div>
            <ScrollArea className="max-h-32">
              <p className="text-xs text-muted-foreground font-mono leading-relaxed whitespace-pre-wrap" data-testid="text-reasoning-log">
                {audit.reasoningLog}
              </p>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {sessions && sessions.length > 0 && allFindings && allFindings.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search findings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm"
                  data-testid="input-search-findings"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2"
                  >
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                {["all", "critical", "major", "minor"].map((sev) => (
                  <Button
                    key={sev}
                    variant={severityFilter === sev ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSeverityFilter(sev)}
                    data-testid={`button-filter-${sev}`}
                  >
                    {sev === "all" ? "All" : sev.charAt(0).toUpperCase() + sev.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {sessions && sessions.length > 0 && (
        <Tabs defaultValue={sessions[0]?.id.toString()} className="space-y-4">
          <TabsList className="w-full justify-start overflow-x-auto flex-nowrap">
            {sessions.map((session) => {
              const personaKey = session.persona.toLowerCase().replace(/\s+/g, "-").replace(/^the-/, "");
              const Icon = PERSONA_ICONS[personaKey] || Ghost;
              return (
                <TabsTrigger
                  key={session.id}
                  value={session.id.toString()}
                  className="flex items-center gap-1.5 shrink-0"
                  data-testid={`tab-session-${session.id}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{session.persona.replace("The ", "")}</span>
                  <span className="sm:hidden">{session.persona.replace("The ", "").split(" ")[0]}</span>
                  {session.findingsCount ? (
                    <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                      {session.findingsCount}
                    </Badge>
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {sessions.map((session) => (
            <TabsContent key={session.id} value={session.id.toString()}>
              <SessionPanel
                session={session}
                findings={allFindings || []}
                remediations={allRemediations || []}
                severityFilter={severityFilter}
                searchQuery={searchQuery}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      {audit.status === "completed" && allFindings && allFindings.length > 0 && (
        <>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold" data-testid="text-category-breakdown">Category Breakdown</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.entries(
                  allFindings.reduce<Record<string, number>>((acc, f) => {
                    acc[f.category] = (acc[f.category] || 0) + 1;
                    return acc;
                  }, {})
                ).sort((a, b) => b[1] - a[1]).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between gap-2 px-3 py-2 rounded-md bg-muted">
                    <span className="text-xs font-medium truncate">{category}</span>
                    <Badge variant="secondary" className="shrink-0">{count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold" data-testid="text-wcag-refs">WCAG References</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(allFindings.filter(f => f.wcagCriteria).map(f => f.wcagCriteria!))).sort().map((criteria) => {
                  const count = allFindings.filter(f => f.wcagCriteria === criteria).length;
                  return (
                    <Badge key={criteria} variant="outline" className="font-mono text-xs">
                      {criteria}
                      {count > 1 && <span className="ml-1 text-muted-foreground">({count})</span>}
                    </Badge>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold" data-testid="text-audit-summary">Audit Summary</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Total findings</span>
                  <span className="text-sm font-semibold">{audit.totalFindings || 0}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Personas analyzed</span>
                  <span className="text-sm font-semibold">{sessions?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Categories affected</span>
                  <span className="text-sm font-semibold">{Array.from(new Set(allFindings.map(f => f.category))).length}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">Remediations available</span>
                  <span className="text-sm font-semibold">{allRemediations?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground">WCAG criteria referenced</span>
                  <span className="text-sm font-semibold">{Array.from(new Set(allFindings.filter(f => f.wcagCriteria).map(f => f.wcagCriteria))).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-primary" />
                <h3 className="text-sm font-semibold" data-testid="text-recommendations">Recommendations</h3>
              </div>
              <div className="space-y-3">
                {(audit.criticalCount || 0) > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-md bg-red-500/5 dark:bg-red-500/10">
                    <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium mb-0.5">Address critical issues first</p>
                      <p className="text-xs text-muted-foreground">{audit.criticalCount} critical {audit.criticalCount === 1 ? "issue blocks" : "issues block"} core functionality for affected users. These should be your top priority.</p>
                    </div>
                  </div>
                )}
                {(audit.majorCount || 0) > 0 && (
                  <div className="flex items-start gap-3 p-3 rounded-md bg-amber-500/5 dark:bg-amber-500/10">
                    <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-medium mb-0.5">Reduce friction for more users</p>
                      <p className="text-xs text-muted-foreground">{audit.majorCount} major {audit.majorCount === 1 ? "issue causes" : "issues cause"} significant friction. Fixing these will noticeably improve the experience.</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 p-3 rounded-md bg-primary/5 dark:bg-primary/10">
                  <Target className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium mb-0.5">Use the remediation code</p>
                    <p className="text-xs text-muted-foreground">Each finding includes CSS or TSX code snippets. Expand findings above to copy the fixes directly into your codebase.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-md bg-primary/5 dark:bg-primary/10">
                  <Shield className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium mb-0.5">Re-audit after fixes</p>
                    <p className="text-xs text-muted-foreground">Run a new Ghost Audit after implementing changes to verify improvements and catch any remaining issues.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
