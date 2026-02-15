import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Plus, Ghost, AlertTriangle, AlertCircle, Info,
  ExternalLink, Clock, CheckCircle2, Loader2,
  Search, X, Trash2, Filter
} from "lucide-react";
import type { Audit } from "@shared/schema";
import { motion } from "framer-motion";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return (
        <Badge variant="default" className="bg-emerald-600 dark:bg-emerald-500 text-white border-emerald-700 dark:border-emerald-400">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    case "analyzing":
      return (
        <Badge variant="default" className="bg-amber-500 dark:bg-amber-400 text-white dark:text-black border-amber-600 dark:border-amber-300">
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Analyzing
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
  }
}

function SeverityPill({ label, count, color }: { label: string; count: number; color: string }) {
  if (count === 0) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color}`}>
      {label === "Critical" && <AlertTriangle className="w-3 h-3" />}
      {label === "Major" && <AlertCircle className="w-3 h-3" />}
      {label === "Minor" && <Info className="w-3 h-3" />}
      {count}
    </span>
  );
}

function AuditCard({ audit, index, onDelete }: { audit: Audit; index: number; onDelete: (id: number) => void }) {
  const urlDisplay = audit.targetUrl.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Card className="hover-elevate active-elevate-2 transition-all duration-200" data-testid={`card-audit-${audit.id}`}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/audit/${audit.id}`} className="flex-1 min-w-0 cursor-pointer">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <StatusBadge status={audit.status} />
                <span className="text-xs text-muted-foreground">
                  {new Date(audit.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm font-medium truncate mb-2" data-testid={`text-audit-url-${audit.id}`}>
                {urlDisplay}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xs text-muted-foreground">
                  {audit.totalFindings || 0} findings
                </span>
                <SeverityPill label="Critical" count={audit.criticalCount || 0} color="text-red-500 dark:text-red-400" />
                <SeverityPill label="Major" count={audit.majorCount || 0} color="text-amber-500 dark:text-amber-400" />
                <SeverityPill label="Minor" count={audit.minorCount || 0} color="text-blue-400 dark:text-blue-300" />
              </div>
            </Link>
            <div className="flex items-center gap-1 shrink-0">
              <Link href={`/audit/${audit.id}`}>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Link>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" data-testid={`button-delete-audit-${audit.id}`}>
                    <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this audit?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently remove the audit for {urlDisplay} and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(audit.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatsCard({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold" data-testid={`text-stat-${title.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
          </div>
          <div className={`p-2 rounded-md ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const { data: audits, isLoading } = useQuery<Audit[]>({
    queryKey: ["/api/audits"],
  });

  const deleteAudit = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/audits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Audit deleted" });
    },
    onError: () => {
      toast({ title: "Failed to delete audit", variant: "destructive" });
    },
  });

  const filteredAudits = useMemo(() => {
    if (!audits) return [];
    let result = audits;
    if (statusFilter !== "all") {
      result = result.filter((a) => a.status === statusFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((a) => a.targetUrl.toLowerCase().includes(q));
    }
    return result;
  }, [audits, searchQuery, statusFilter]);

  const totalAudits = audits?.length || 0;
  const totalFindings = audits?.reduce((sum, a) => sum + (a.totalFindings || 0), 0) || 0;
  const totalCritical = audits?.reduce((sum, a) => sum + (a.criticalCount || 0), 0) || 0;
  const completedAudits = audits?.filter((a) => a.status === "completed").length || 0;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 pb-12">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-dashboard-title">
            Ghost Audits
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage your UX accessibility audits
          </p>
        </div>
        <Link href="/new-audit">
          <Button data-testid="button-new-audit">
            <Plus className="w-4 h-4 mr-2" />
            New Audit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatsCard
          title="Total Audits"
          value={totalAudits}
          icon={<Ghost className="w-5 h-5 text-primary-foreground" />}
          color="bg-primary"
        />
        <StatsCard
          title="Completed"
          value={completedAudits}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-100" />}
          color="bg-emerald-600 dark:bg-emerald-500"
        />
        <StatsCard
          title="Total Findings"
          value={totalFindings}
          icon={<AlertCircle className="w-5 h-5 text-amber-100" />}
          color="bg-amber-500"
        />
        <StatsCard
          title="Critical Issues"
          value={totalCritical}
          icon={<AlertTriangle className="w-5 h-5 text-red-100" />}
          color="bg-red-600 dark:bg-red-500"
        />
      </div>

      {audits && audits.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative flex-1 min-w-[180px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by URL..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-9 text-sm"
                  data-testid="input-search-audits"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    <X className="w-3.5 h-3.5 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                {["all", "completed", "analyzing", "pending"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilter === status ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(status)}
                    data-testid={`button-status-${status}`}
                  >
                    {status === "all" ? "All" : status.charAt(0).toUpperCase() + status.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24" />
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredAudits.length > 0 ? (
        <div className="space-y-3">
          {filteredAudits.map((audit, i) => (
            <AuditCard key={audit.id} audit={audit} index={i} onDelete={(id) => deleteAudit.mutate(id)} />
          ))}
        </div>
      ) : audits && audits.length > 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Search className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-sm font-medium mb-1">No matching audits</h3>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-muted">
                <Ghost className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">No audits yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your first ghost audit to uncover hidden UX issues
                </p>
                <Link href="/new-audit">
                  <Button data-testid="button-first-audit">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Audit
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
