"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { PromptPanel } from "@/components/PromptPanel";
import { LogsPanel } from "@/components/LogsPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { WalletButton } from "@/components/WalletButton";
import { CommandPalette } from "@/components/CommandPalette";
import { NeonButton } from "@/components/NeonButton";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ToastProvider";
import { useLogs } from "@/hooks/useLogs";
import { useWorkspaceState } from "@/hooks/useWorkspaceState";

const GATEWAY_URL = process.env["NEXT_PUBLIC_GATEWAY_URL"] ?? "http://localhost:3001";
const WS_URL = process.env["NEXT_PUBLIC_WS_URL"] ?? "ws://localhost:3001";

export default function Home() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const { logs, addLog, clearLogs } = useLogs(WS_URL);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { state, hydrated, setPromptDraft, setOutputTab, setActiveWorkspaceTab } = useWorkspaceState();

  const issueToken = useCallback(async () => {
    const res = await fetch(`${GATEWAY_URL}/auth/token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workspaceId: "studio" }),
    });
    const data = await res.json() as Record<string, unknown>;
    if (!res.ok || typeof data["token"] !== "string") {
      throw new Error("Unable to establish authenticated session");
    }
    setAuthToken(data["token"]);
    return data["token"];
  }, []);

  useEffect(() => {
    issueToken().catch((error) => {
      const message = error instanceof Error ? error.message : "Authentication failed";
      showToast({ title: "Authentication failed", description: message, variant: "error" });
    });
  }, [issueToken, showToast]);

  const handleRun = useCallback(async (prompt: string) => {
    setLoading(true);
    setResult(null);
    clearLogs();

    try {
      const token = authToken ?? await issueToken();
      const res = await fetch(`${GATEWAY_URL}/run`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) {
        const message = typeof data["error"] === "string" ? data["error"] : "Run failed";
        throw new Error(message);
      }
      setResult(data);
      showToast({ title: "Run completed", description: "Pipeline output is ready.", variant: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Request failed";
      addLog({ step: "error", message });
      showToast({ title: "Run failed", description: message, variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [addLog, authToken, clearLogs, issueToken, showToast]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const commands = useMemo(() => ([
    {
      id: "toggle-theme",
      label: "Toggle theme",
      shortcut: "⌘K",
      run: () => {
        toggleTheme();
        showToast({ title: `Theme: ${theme === "dark" ? "Light" : "Dark"}`, variant: "info" });
      },
    },
    {
      id: "clear-logs",
      label: "Clear logs",
      run: () => clearLogs(),
    },
    {
      id: "focus-studio",
      label: "Switch to Studio tab",
      run: () => setActiveWorkspaceTab("studio"),
    },
    {
      id: "focus-history",
      label: "Switch to History tab",
      run: () => setActiveWorkspaceTab("history"),
    },
  ]), [clearLogs, setActiveWorkspaceTab, showToast, theme, toggleTheme]);

  return (
    <div className="workspace-shell min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
            R
          </div>
          <span className="font-semibold text-lg">RemixOS Studio</span>
          <span className="text-xs text-white/40 font-mono">v1.2-beta</span>
        </div>
        <div className="flex items-center gap-2">
          <NeonButton variant="secondary" onClick={toggleTheme}>
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </NeonButton>
          <NeonButton variant="secondary" onClick={() => setCommandPaletteOpen(true)}>
            ⌘K
          </NeonButton>
          <WalletButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs ${state.activeWorkspaceTab === "studio" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
            onClick={() => setActiveWorkspaceTab("studio")}
          >
            Studio
          </button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs ${state.activeWorkspaceTab === "history" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
            onClick={() => setActiveWorkspaceTab("history")}
          >
            History
          </button>
        </div>

        {state.activeWorkspaceTab === "history" ? (
          <div className="glass-panel">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Workspace History</h2>
            <p className="state-message mt-2 text-sm">No history entries yet. Saved runs and snapshots will appear here.</p>
          </div>
        ) : null}

        {state.activeWorkspaceTab === "studio" && !hydrated ? (
          <div className="glass-panel">
            <p className="state-message text-sm">Restoring workspace…</p>
          </div>
        ) : null}

        {state.activeWorkspaceTab === "studio" && hydrated ? (
          <>
        {/* Prompt Panel */}
            <PromptPanel
              onRun={handleRun}
              prompt={state.promptDraft}
              onPromptChange={setPromptDraft}
              loading={loading}
            />

        {/* Logs + Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <LogsPanel logs={logs} />
              <OutputPanel result={result} tab={state.outputTab} onTabChange={setOutputTab} loading={loading} />
            </div>
          </>
        ) : null}
      </main>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} commands={commands} />
    </div>
  );
}
