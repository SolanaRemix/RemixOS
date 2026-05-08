"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { NeonButton } from "@/components/NeonButton";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SystemMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon: string;
}

interface ActivityEntry {
  id: string;
  actor: string;
  action: string;
  status: "success" | "failure" | "warning";
  timestamp: number;
  metadata?: string;
}

interface ServiceStatus {
  name: string;
  status: "healthy" | "degraded" | "down";
  latencyMs: number;
  uptime: string;
  url: string;
}

// ─── Mock Data Generators ─────────────────────────────────────────────────────

function generateActivity(): ActivityEntry[] {
  const actions = [
    { action: "run_completed", status: "success" as const, meta: "webapp" },
    { action: "run_requested", status: "success" as const, meta: "api" },
    { action: "auth_failed", status: "failure" as const, meta: "invalid_token" },
    { action: "rate_limited", status: "warning" as const, meta: "60r/m exceeded" },
    { action: "issue_token", status: "success" as const, meta: "studio" },
    { action: "run_completed", status: "success" as const, meta: "trade" },
  ];

  return Array.from({ length: 12 }, (_, i) => {
    const a = actions[i % actions.length]!;
    return {
      id: `evt-${i}`,
      actor: i % 3 === 0 ? "anonymous" : `user-${(i * 7 + 3) % 100}`,
      action: a.action,
      status: a.status,
      timestamp: Date.now() - i * 47_000,
      metadata: a.meta,
    };
  });
}

const GATEWAY_URL = process.env["NEXT_PUBLIC_GATEWAY_URL"] ?? "http://localhost:3001";

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "activity" | "ai" | "deployments">("overview");
  const [activity] = useState<ActivityEntry[]>(generateActivity);
  const [gatewayHealth, setGatewayHealth] = useState<{ status: string; timestamp?: number } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);

  const checkHealth = useCallback(async () => {
    setLoadingHealth(true);
    try {
      const res = await fetch(`${GATEWAY_URL}/health`);
      const data = await res.json() as { status: string; timestamp?: number };
      setGatewayHealth(data);
    } catch {
      setGatewayHealth({ status: "unreachable" });
    } finally {
      setLoadingHealth(false);
    }
  }, []);

  useEffect(() => {
    void checkHealth();
    const interval = setInterval(() => void checkHealth(), 30_000);
    return () => clearInterval(interval);
  }, [checkHealth]);

  const metrics: SystemMetric[] = [
    { label: "Total Runs", value: "1,284", change: "+12%", trend: "up", icon: "⚡" },
    { label: "Active Users", value: "47", change: "+3", trend: "up", icon: "👥" },
    { label: "AI Tokens Used", value: "2.4M", change: "+8%", trend: "up", icon: "🤖" },
    { label: "Error Rate", value: "0.3%", change: "-0.1%", trend: "down", icon: "⚠️" },
    { label: "Avg Latency", value: "842ms", change: "-60ms", trend: "down", icon: "⏱" },
    { label: "Revenue (MTD)", value: "$1,240", change: "+22%", trend: "up", icon: "💰" },
  ];

  const services: ServiceStatus[] = [
    {
      name: "Gateway API",
      status: gatewayHealth?.status === "ok" ? "healthy" : gatewayHealth ? "degraded" : "down",
      latencyMs: 42,
      uptime: "99.98%",
      url: GATEWAY_URL,
    },
    { name: "Studio UI", status: "healthy", latencyMs: 18, uptime: "99.99%", url: "http://localhost:3000" },
    { name: "Go Core", status: "healthy", latencyMs: 8, uptime: "99.95%", url: "http://localhost:8080" },
    { name: "Redis", status: "healthy", latencyMs: 1, uptime: "100%", url: "redis://localhost:6379" },
  ];

  const aiProviders = [
    { name: "OpenAI GPT-4o", configured: !!process.env["NEXT_PUBLIC_OPENAI_CONFIGURED"], model: "gpt-4o-mini", tokensUsed: 980_000 },
    { name: "Anthropic Claude", configured: false, model: "claude-3-5-haiku", tokensUsed: 0 },
    { name: "Grok (xAI)", configured: false, model: "grok-2-latest", tokensUsed: 0 },
    { name: "DeepSeek", configured: false, model: "deepseek-chat", tokensUsed: 0 },
    { name: "Gemini", configured: false, model: "gemini-1.5-flash", tokensUsed: 0 },
    { name: "Ollama (Local)", configured: false, model: "llama3.2", tokensUsed: 0 },
  ];

  const statusColors: Record<string, string> = {
    healthy: "text-green-400",
    degraded: "text-yellow-400",
    down: "text-red-400",
  };

  const statusDots: Record<string, string> = {
    healthy: "bg-green-400",
    degraded: "bg-yellow-400",
    down: "bg-red-400",
  };

  const activityColors: Record<string, string> = {
    success: "text-green-400",
    failure: "text-red-400",
    warning: "text-yellow-400",
  };

  return (
    <div className="workspace-shell min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">R</div>
            <span className="font-semibold text-lg">RemixOS</span>
          </Link>
          <span className="text-white/30">/</span>
          <span className="text-sm text-white/70">Admin</span>
        </div>
        <div className="flex items-center gap-2">
          <NeonButton variant="secondary" onClick={() => void checkHealth()} disabled={loadingHealth}>
            {loadingHealth ? "⟳ Refreshing…" : "⟳ Refresh"}
          </NeonButton>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit">
          {(["overview", "activity", "ai", "deployments"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-all ${
                activeTab === tab ? "bg-white/20 text-white font-medium" : "text-white/50 hover:text-white"
              }`}
            >
              {{ overview: "📊 Overview", activity: "📋 Activity", ai: "🤖 AI Providers", deployments: "🚀 Deployments" }[tab]}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {metrics.map((m) => (
                <div key={m.label} className="glass-panel space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-lg">{m.icon}</span>
                    {m.change && (
                      <span className={`text-xs font-medium ${
                        m.trend === "up" && m.label !== "Error Rate" ? "text-green-400"
                        : m.trend === "down" && m.label === "Error Rate" ? "text-green-400"
                        : m.trend === "down" ? "text-red-400"
                        : "text-white/50"
                      }`}>
                        {m.change}
                      </span>
                    )}
                  </div>
                  <div className="text-xl font-bold">{m.value}</div>
                  <div className="text-xs text-white/50">{m.label}</div>
                </div>
              ))}
            </div>

            {/* Services Status */}
            <div className="glass-panel">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">Service Status</h2>
              <div className="space-y-2">
                {services.map((svc) => (
                  <div key={svc.name} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${statusDots[svc.status] ?? "bg-gray-400"}`} />
                      <span className="text-sm font-medium">{svc.name}</span>
                    </div>
                    <div className="flex items-center gap-6 text-xs text-white/50">
                      <span className={statusColors[svc.status] ?? "text-white"}>{svc.status}</span>
                      <span>{svc.latencyMs}ms</span>
                      <span>{svc.uptime} uptime</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="glass-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">Audit Log</h2>
            <div className="space-y-1">
              {activity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0 text-sm">
                  <span className={`mt-0.5 font-medium min-w-0 ${activityColors[entry.status] ?? ""}`}>
                    {entry.status === "success" ? "✔" : entry.status === "failure" ? "✖" : "⚠"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white/80">{entry.actor}</span>
                      <span className="text-white/40">→</span>
                      <span className="font-mono text-xs bg-white/10 px-1.5 py-0.5 rounded">{entry.action}</span>
                      {entry.metadata && (
                        <span className="text-white/40 text-xs">[{entry.metadata}]</span>
                      )}
                    </div>
                  </div>
                  <span className="text-xs text-white/30 whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI Providers Tab */}
        {activeTab === "ai" && (
          <div className="glass-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">AI Providers</h2>
            <p className="text-xs text-white/40 mb-4">
              Configure provider API keys via environment variables. The AI router automatically uses configured providers with fallback.
            </p>
            <div className="space-y-2">
              {aiProviders.map((p) => (
                <div key={p.name} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${p.configured ? "bg-green-400" : "bg-white/20"}`} />
                    <div>
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-xs text-white/40 font-mono">{p.model}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span>{p.tokensUsed > 0 ? `${(p.tokensUsed / 1000).toFixed(0)}K tokens` : "0 tokens"}</span>
                    <span className={p.configured ? "text-green-400" : "text-white/30"}>
                      {p.configured ? "Configured" : "Not configured"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-white/50 font-mono">
              Set OPENAI_API_KEY, ANTHROPIC_API_KEY, etc. in your .env file to enable providers.
            </div>
          </div>
        )}

        {/* Deployments Tab */}
        {activeTab === "deployments" && (
          <div className="glass-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">Deployment Targets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                { name: "Vercel", icon: "▲", cmd: "pnpm tsx scripts/deploy.ts vercel --prod", status: "ready" },
                { name: "Netlify", icon: "◈", cmd: "pnpm tsx scripts/deploy.ts netlify --prod", status: "ready" },
                { name: "Docker", icon: "🐳", cmd: "pnpm tsx scripts/deploy.ts docker", status: "ready" },
                { name: "Railway", icon: "🚂", cmd: "pnpm tsx scripts/deploy.ts railway --prod", status: "ready" },
                { name: "Fly.io", icon: "🪁", cmd: "pnpm tsx scripts/deploy.ts fly --prod", status: "ready" },
                { name: "VPS", icon: "🖥", cmd: "VPS_HOST=your-host pnpm tsx scripts/deploy.ts vps --prod", status: "ready" },
              ].map((d) => (
                <div key={d.name} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{d.icon}</span>
                      <span className="font-semibold">{d.name}</span>
                    </div>
                    <span className="text-xs text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">{d.status}</span>
                  </div>
                  <code className="text-xs text-white/40 font-mono break-all">{d.cmd}</code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
