"use client";

import { useEffect, useMemo, useState } from "react";

export type WorkspaceTab = "studio" | "versions";
export type OutputTab = "preview" | "code" | "json";
export type WorkspaceResult = Record<string, unknown> | null;

interface WorkspaceState {
  activeWorkspaceTab: WorkspaceTab;
  outputTab: OutputTab;
  promptDraft: string;
  result: WorkspaceResult;
}

const STORAGE_KEY = "remixos.workspace.v1";

const defaultState: WorkspaceState = {
  activeWorkspaceTab: "studio",
  outputTab: "preview",
  promptDraft: "",
  result: null,
};

export function useWorkspaceState() {
  const [state, setState] = useState<WorkspaceState>(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<WorkspaceState>;
        const parsedTab = typeof (parsed as { activeWorkspaceTab?: string }).activeWorkspaceTab === "string"
          ? (parsed as { activeWorkspaceTab?: string }).activeWorkspaceTab
          : "studio";
        const outputTab = parsed.outputTab === "code" || parsed.outputTab === "json" || parsed.outputTab === "preview"
          ? parsed.outputTab
          : "preview";
        setState({
          activeWorkspaceTab: parsedTab === "versions" || parsedTab === "history" ? "versions" : "studio",
          outputTab,
          promptDraft: typeof parsed.promptDraft === "string" ? parsed.promptDraft : "",
          result: typeof parsed.result === "object" || parsed.result === null
            ? (parsed.result as WorkspaceResult)
            : null,
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
    setResult: (result: WorkspaceResult) => setState((prev) => ({ ...prev, result })),
  }), [hydrated, state]);
}
