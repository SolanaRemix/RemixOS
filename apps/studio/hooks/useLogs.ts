"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { LogEvent } from "@/components/types";

export function useLogs(wsUrl: string) {
  const [logs, setLogs] = useState<LogEvent[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data as string) as LogEvent;
          setLogs((prev) => [...prev, data]);
        } catch {
          // ignore parse errors
        }
      };

      ws.onerror = () => {
        // WebSocket connection failed - gateway may not be running
      };
    } catch {
      // WebSocket not supported or URL invalid
    }

    return () => {
      wsRef.current?.close();
    };
  }, [wsUrl]);

  const addLog = useCallback((event: LogEvent) => {
    setLogs((prev) => [...prev, event]);
  }, []);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs };
}
