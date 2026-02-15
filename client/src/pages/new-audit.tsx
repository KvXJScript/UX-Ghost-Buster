import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, Globe, Zap, UserRound, Keyboard, Eye, Smartphone, Brain, Baby, Accessibility } from "lucide-react";
import { Link } from "wouter";
import { motion } from "framer-motion";

const PERSONAS = [
  {
    id: "distracted-parent",
    name: "The Distracted Parent",
    description: "Multitasking with children, limited attention span, frequent interruptions",
    icon: Baby,
    color: "text-pink-500 dark:text-pink-400",
    bgColor: "bg-pink-500/10 dark:bg-pink-400/10",
  },
  {
    id: "keyboard-only",
    name: "The Keyboard-Only User",
    description: "Navigates entirely by keyboard, no mouse or trackpad usage",
    icon: Keyboard,
    color: "text-blue-500 dark:text-blue-400",
    bgColor: "bg-blue-500/10 dark:bg-blue-400/10",
  },
  {
    id: "low-vision",
    name: "The Low-Vision User",
    description: "Uses screen magnification, needs high contrast and large targets",
    icon: Eye,
    color: "text-purple-500 dark:text-purple-400",
    bgColor: "bg-purple-500/10 dark:bg-purple-400/10",
  },
  {
    id: "mobile-commuter",
    name: "The Mobile Commuter",
    description: "On shaky public transit, one-handed usage, poor connectivity",
    icon: Smartphone,
    color: "text-emerald-500 dark:text-emerald-400",
    bgColor: "bg-emerald-500/10 dark:bg-emerald-400/10",
  },
  {
    id: "cognitive-load",
    name: "The Overwhelmed User",
    description: "Cognitive overload, unfamiliar with tech, needs clear guidance",
    icon: Brain,
    color: "text-amber-500 dark:text-amber-400",
    bgColor: "bg-amber-500/10 dark:bg-amber-400/10",
  },
  {
    id: "screen-reader",
    name: "The Screen Reader User",
    description: "Relies on ARIA labels, semantic HTML, and logical tab order",
    icon: Accessibility,
    color: "text-cyan-500 dark:text-cyan-400",
    bgColor: "bg-cyan-500/10 dark:bg-cyan-400/10",
  },
];

export default function NewAudit() {
  const params = new URLSearchParams(window.location.search);
  const prefillUrl = params.get("url") || "";
  const prefillPersonas = params.get("personas");

  const [url, setUrl] = useState(prefillUrl);
  const [selectedPersonas, setSelectedPersonas] = useState<string[]>(
    prefillPersonas ? prefillPersonas.split(",").filter(Boolean) : ["distracted-parent", "keyboard-only"]
  );
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const createAudit = useMutation({
    mutationFn: async () => {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }
      const res = await apiRequest("POST", "/api/audits", {
        targetUrl: normalizedUrl,
        personas: selectedPersonas,
      });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/audits"] });
      toast({ title: "Audit created", description: "Ghost analysis is starting..." });
      navigate(`/audit/${data.id}`);
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const togglePersona = (id: string) => {
    setSelectedPersonas((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const isValidUrl = url.length > 0 && (url.startsWith("http://") || url.startsWith("https://") || url.includes("."));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight" data-testid="text-new-audit-title">
            New Ghost Audit
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter a URL and select personas to analyze
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="url" className="text-sm font-medium">Target URL</Label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
                data-testid="input-target-url"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <Label className="text-sm font-medium">Ghost Personas</Label>
              <span className="text-xs text-muted-foreground">
                {selectedPersonas.length} selected
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERSONAS.map((persona, index) => {
                const isSelected = selectedPersonas.includes(persona.id);
                const Icon = persona.icon;
                return (
                  <motion.div
                    key={persona.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-200 toggle-elevate ${
                        isSelected ? "toggle-elevated border-primary/50" : ""
                      }`}
                      onClick={() => togglePersona(persona.id)}
                      data-testid={`card-persona-${persona.id}`}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-md ${persona.bgColor} shrink-0`}>
                            <Icon className={`w-4 h-4 ${persona.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium">{persona.name}</span>
                              {isSelected && (
                                <Badge variant="default" className="text-[10px] px-1.5 py-0">
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {persona.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <Button
            onClick={() => createAudit.mutate()}
            disabled={!isValidUrl || selectedPersonas.length === 0 || createAudit.isPending}
            className="w-full"
            data-testid="button-start-audit"
          >
            {createAudit.isPending ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-pulse" />
                Summoning Ghosts...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Start Ghost Audit
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
