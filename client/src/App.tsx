import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { ThemeToggle } from "@/components/theme-toggle";
import { ErrorBoundary } from "@/components/error-boundary";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import NewAudit from "@/pages/new-audit";
import AuditDetail from "@/pages/audit-detail";
import { Ghost } from "lucide-react";
import { Link } from "wouter";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/new-audit" component={NewAudit} />
      <Route path="/audit/:id" component={AuditDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4 px-4 md:px-6 h-14">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer hover-elevate rounded-md px-2 py-1" data-testid="link-home">
            <div className="p-1.5 rounded-md bg-primary">
              <Ghost className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-sm tracking-tight">UX Ghost Buster</span>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/dashboard">
            <span className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer hidden sm:inline" data-testid="link-nav-dashboard">Dashboard</span>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <div className="min-h-screen bg-background text-foreground">
              <AppHeader />
              <main>
                <Router />
              </main>
            </div>
          </ErrorBoundary>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
