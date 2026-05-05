export interface GXQSResult {
  output: string;
  engine: "gxqs";
  latency?: number;
}

export async function runGXQS(input: string): Promise<GXQSResult> {
  // Adapter: calls Go GXQS microservice at localhost:8080
  // In production, replace with real fetch to Go service
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("http://localhost:8080/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ input }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json() as { output: string };
    return { output: data.output, engine: "gxqs" };
  } catch {
    // Fallback when Go service is not running
    return {
      output: `GXQS simulation: processed "${input.slice(0, 50)}"`,
      engine: "gxqs",
    };
  }
}
