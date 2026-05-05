"use client";

import { useState, useCallback } from "react";
import { PromptPanel } from "@/components/PromptPanel";
import { LogsPanel } from "@/components/LogsPanel";
import { OutputPanel } from "@/components/OutputPanel";
import { WalletButton } from "@/components/WalletButton";
import { useLogs } from "@/hooks/useLogs";

const GATEWAY_URL = process.env["NEXT_PUBLIC_GATEWAY_URL"] ?? "http://localhost:3001";
const WS_URL = process.env["NEXT_PUBLIC_WS_URL"] ?? "ws://localhost:3001";

export default function Home() {
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const { logs, addLog, clearLogs } = useLogs(WS_URL);

  const handleRun = useCallback(async (prompt: string) => {
    setLoading(true);
    setResult(null);
    clearLogs();

    try {
      const res = await fetch(`${GATEWAY_URL}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json() as Record<string, unknown>;
      setResult(data);
    } catch (err) {
      addLog({ step: "error", message: err instanceof Error ? err.message : "Request failed" });
    } finally {
      setLoading(false);
    }
  }, [addLog, clearLogs]);

  return (
    <div className="min-h-screen bg-[#05070a]">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-sm font-bold">
            R
          </div>
          <span className="font-semibold text-white text-lg">RemixOS Studio</span>
          <span className="text-xs text-white/40 font-mono">v1.1</span>
        </div>
        <WalletButton />
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto p-6 space-y-4">
        {/* Prompt Panel */}
        <PromptPanel onRun={handleRun} loading={loading} />

        {/* Logs + Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <LogsPanel logs={logs} />
          <OutputPanel result={result} loading={loading} />
        </div>
      </main>
    </div>
  );
}
