"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { PromptPanel } from "@/components/PromptPanel";
import { LogsPanel } from "@/components/LogsPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { ProjectVersionsPanel } from "@/components/ProjectVersionsPanel";
import { WalletButton } from "@/components/WalletButton";
import { CommandPalette } from "@/components/CommandPalette";
import { NeonButton } from "@/components/NeonButton";
import { useTheme } from "@/components/ThemeProvider";
import { useToast } from "@/components/ToastProvider";
import { useLogs } from "@/hooks/useLogs";
import { useWorkspaceState } from "@/hooks/useWorkspaceState";
import { createProjectVersion, type ProjectVersion } from "@/lib/projectVersions";
import Link from "next/link";

const GATEWAY_URL = process.env["NEXT_PUBLIC_GATEWAY_URL"] ?? "http://localhost:3001";
const WS_URL = process.env["NEXT_PUBLIC_WS_URL"] ?? "ws://localhost:3001";
const VERSION_STORAGE_KEY = "remixos.project-versions.v1";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [versions, setVersions] = useState<ProjectVersion[]>([]);
  const [versionsHydrated, setVersionsHydrated] = useState(false);
  const { logs, addLog, clearLogs } = useLogs(WS_URL);
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const { state, hydrated, setPromptDraft, setOutputTab, setActiveWorkspaceTab, setResult } = useWorkspaceState();

  const currentSnapshot = useMemo(() => ({
    promptDraft: state.promptDraft,
    outputTab: state.outputTab,
    result: state.result,
  }), [state.outputTab, state.promptDraft, state.result]);

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
  }, [addLog, authToken, clearLogs, issueToken, setResult, showToast]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(VERSION_STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw) as ProjectVersion[];
      if (Array.isArray(parsed)) {
        setVersions(parsed.filter((version) => typeof version?.id === "string" && typeof version?.name === "string"));
      }
    } catch {
      // ignore corrupted version storage
    } finally {
      setVersionsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!versionsHydrated) {
      return;
    }

    window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(versions));
  }, [versions, versionsHydrated]);

  const saveVersion = useCallback((options?: { customName?: string; description?: string; kind?: "named" | "auto" | "safety" }) => {
    if (!currentSnapshot.promptDraft.trim() && !currentSnapshot.result) {
      showToast({ title: "Nothing to version yet", description: "Run a prompt or draft a project before saving a version.", variant: "info" });
      return;
    }

    const version = createProjectVersion(currentSnapshot, options);
    setVersions((prev) => [version, ...prev]);
    setActiveWorkspaceTab("versions");
    showToast({
      title: "Version saved",
      description: `${version.name} is now available in the Versions tab.`,
      variant: "success",
    });
  }, [currentSnapshot, setActiveWorkspaceTab, showToast]);

  const updateVersion = useCallback((versionId: string, patch: { name?: string; description?: string }) => {
    setVersions((prev) => prev.map((version) => version.id === versionId
      ? {
        ...version,
        name: patch.name ?? version.name,
        description: patch.description ?? version.description,
      }
      : version));
  }, []);

  const revertToVersion = useCallback((version: ProjectVersion) => {
    const safetyVersion = createProjectVersion(currentSnapshot, {
      kind: "safety",
      description: `Safety snapshot created before reverting to ${version.name}.`,
    });

    setVersions((prev) => [safetyVersion, ...prev]);
    setPromptDraft(version.snapshot.promptDraft);
    setOutputTab(version.snapshot.outputTab);
    setResult(version.snapshot.result);
    setActiveWorkspaceTab("studio");
    showToast({
      title: "Project reverted",
      description: `Restored ${version.name}. A pre-revert safety snapshot was saved first.`,
      variant: "success",
    });
  }, [currentSnapshot, setActiveWorkspaceTab, setOutputTab, setPromptDraft, setResult, showToast]);

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
      id: "save-version",
      label: "Save project version",
      run: () => saveVersion(),
    },
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
      id: "focus-versions",
      label: "Switch to Versions tab",
      run: () => setActiveWorkspaceTab("versions"),
    },
  ]), [clearLogs, saveVersion, setActiveWorkspaceTab, showToast, theme, toggleTheme]);

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
        <nav className="hidden md:flex items-center gap-1">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all">
            Studio
          </Link>
          <Link href="/builder" className="px-3 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all">
            AI Builder
          </Link>
          <Link href="/admin" className="px-3 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition-all">
            Admin
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <NeonButton onClick={() => saveVersion()}>
            Save Version
          </NeonButton>
          <NeonButton variant="secondary" onClick={toggleTheme}>
            {theme === "dark" ? "☀ Light" : "🌙 Dark"}
          </NeonButton>
          <NeonButton variant="secondary" onClick={() => setCommandPaletteOpen(true)}>
            ⌘K
          </NeonButton>
          <WalletButton />
        </div>
      </header>
      <div className="md:hidden border-b border-white/10 px-4 py-2">
        <nav className="flex items-center gap-2 overflow-x-auto">
          <Link href="/" className="px-3 py-1.5 rounded-lg text-xs bg-white/10 text-white whitespace-nowrap">
            Studio
          </Link>
          <Link href="/builder" className="px-3 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 whitespace-nowrap">
            AI Builder
          </Link>
          <Link href="/admin" className="px-3 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 whitespace-nowrap">
            Admin
          </Link>
        </nav>
      </div>

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
            className={`rounded-lg px-3 py-1.5 text-xs ${state.activeWorkspaceTab === "versions" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
            onClick={() => setActiveWorkspaceTab("versions")}
          >
            Versions
          </button>
        </div>

        {state.activeWorkspaceTab === "versions" ? (
          <ProjectVersionsPanel
            currentSnapshot={currentSnapshot}
            versions={versions}
            onCreateVersion={saveVersion}
            onUpdateVersion={updateVersion}
            onRevertVersion={revertToVersion}
          />
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
              <OutputPanel result={state.result} tab={state.outputTab} onTabChange={setOutputTab} loading={loading} />
            </div>
          </>
        ) : null}
      </main>
      <CommandPalette open={commandPaletteOpen} onClose={() => setCommandPaletteOpen(false)} commands={commands} />
    </div>
  );
}
