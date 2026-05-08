"use client";

import { useEffect, useMemo, useState } from "react";

export type WorkspaceTab = "studio" | "history";
export type OutputTab = "preview" | "code" | "json";

interface WorkspaceState {
  activeWorkspaceTab: WorkspaceTab;
  outputTab: OutputTab;
  promptDraft: string;
}

const STORAGE_KEY = "remixos.workspace.v1";

const defaultState: WorkspaceState = {
  activeWorkspaceTab: "studio",
  outputTab: "preview",
  promptDraft: "",
};

export function useWorkspaceState() {
  const [state, setState] = useState<WorkspaceState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
        const outputTab = parsed.outputTab === "code" || parsed.outputTab === "json" || parsed.outputTab === "preview"
          ? parsed.outputTab
          : "preview";
        setState({
          activeWorkspaceTab: parsed.activeWorkspaceTab === "history" ? "history" : "studio",
          outputTab,
          promptDraft: typeof parsed.promptDraft === "string" ? parsed.promptDraft : "",
        });
      }
    } catch {
      // ignore corrupted workspace storage
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  return useMemo(() => ({
    state,
    hydrated,
    setActiveWorkspaceTab: (activeWorkspaceTab: WorkspaceTab) => setState((prev) => ({ ...prev, activeWorkspaceTab })),
    setOutputTab: (outputTab: OutputTab) => setState((prev) => ({ ...prev, outputTab })),
    setPromptDraft: (promptDraft: string) => setState((prev) => ({ ...prev, promptDraft })),
  }), [hydrated, state]);
}
