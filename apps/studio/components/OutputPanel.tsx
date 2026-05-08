"use client";

import { Glass } from "./Glass";
import { Skeleton } from "./Skeleton";
import type { OutputTab } from "@/hooks/useWorkspaceState";

interface OutputPanelProps {
  result: Record<string, unknown> | null;
  tab: OutputTab;
  onTabChange: (tab: OutputTab) => void;
  loading?: boolean;
}

export function OutputPanel({ result, tab, onTabChange, loading = false }: OutputPanelProps) {

  const html = typeof result?.["build"] === "object" && result["build"] !== null
    ? (result["build"] as Record<string, unknown>)["html"] as string | undefined
    : undefined;

  const code = typeof result?.["build"] === "object" && result["build"] !== null
    ? (result["build"] as Record<string, unknown>)["code"] as string | undefined
    : undefined;

  return (
    <Glass className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Output
        </h2>
        <div className="flex gap-1">
          {(["preview", "code", "json"] as OutputTab[]).map((t) => (
            <button
              key={t}
              onClick={() => onTabChange(t)}
              className={`text-xs px-2 py-1 rounded-lg transition-colors ${
                tab === t
                  ? "bg-white/20 text-white"
                  : "text-white/40 hover:text-white/70"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 overflow-auto">
        {loading && (
          <div className="space-y-2 p-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {!loading && !result && (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">
            Run a prompt to see output
          </div>
        )}

        {!loading && result && tab === "preview" && (
          <iframe
            srcDoc={html ?? "<div style='color:white;padding:20px;font-family:sans-serif'>No HTML preview available</div>"}
            className="w-full h-full rounded-xl bg-white/5 border border-white/10"
            sandbox=""
            title="App preview"
          />
        )}

        {!loading && result && tab === "code" && (
          <pre className="text-xs text-green-300 whitespace-pre-wrap font-mono p-2">
            {code ?? "No code output"}
          </pre>
        )}

        {!loading && result && tab === "json" && (
          <pre className="text-xs text-blue-300 whitespace-pre-wrap font-mono p-2">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </Glass>
  );
}
