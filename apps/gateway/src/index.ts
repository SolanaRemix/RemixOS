import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import { runTask } from "@remixos/orchestrator";
import type { LogEvent } from "@remixos/shared";

const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

app.use(cors());
app.use(express.json());

// Connected WebSocket clients
const clients = new Set<WebSocket>();

wss.on("connection", (ws) => {
  clients.add(ws);
  ws.on("close", () => clients.delete(ws));
  ws.send(JSON.stringify({ step: "connected", message: "RemixOS Gateway connected" }));
});

function broadcast(event: LogEvent): void {
  const message = JSON.stringify(event);
  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "remixos-gateway", timestamp: Date.now() });
});

app.post("/run", async (req, res) => {
  const body = req.body as { prompt?: string };
  const { prompt } = body;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    res.status(400).json({ error: "Missing or invalid prompt" });
    return;
  }

  const MAX_PROMPT_BYTES = 16384; // 16 KB
  if (Buffer.byteLength(prompt, "utf8") > MAX_PROMPT_BYTES) {
    res.status(413).json({ error: "Prompt too large (max 16384 bytes)" });
    return;
  }

  try {
    const result = await runTask(prompt.trim(), broadcast);
    if ("error" in result) {
      res.status(500).json(result);
    } else {
      res.json(result);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    res.status(500).json({ error: message });
  }
});

const PORT = process.env["PORT"] ?? 3001;
httpServer.listen(PORT, () => {
  console.log(`RemixOS Gateway running on http://localhost:${PORT}`);
  console.log(`WebSocket server ready on ws://localhost:${PORT}`);
});

export default app;
