"use client";

import { useEffect, useRef } from "react";
import { Glass } from "./Glass";
import type { LogEvent } from "./types";

interface LogsPanelProps {
  logs: LogEvent[];
}

const STEP_COLORS: Record<string, string> = {
  start: "text-blue-400",
  cyberai: "text-purple-400",
  planner: "text-yellow-400",
  builder: "text-orange-400",
  executor: "text-green-400",
  security: "text-red-400",
  fixer: "text-pink-400",
  complete: "text-green-300",
  error: "text-red-300",
  connected: "text-white/50",
};

export function LogsPanel({ logs }: LogsPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  return (
    <Glass className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Live Logs
        </h2>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-white/40">{logs.length} events</span>
        </span>
      </div>

      <div className="h-64 overflow-y-auto font-mono text-xs space-y-1 pr-1">
        {logs.length === 0 ? (
          <p className="text-white/20 text-center pt-8">Waiting for events...</p>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className={`font-semibold min-w-[80px] ${STEP_COLORS[log.step] ?? "text-white/50"}`}>
                [{log.step}]
              </span>
              <span className="text-white/70">{log.message ?? ""}</span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </Glass>
  );
}
