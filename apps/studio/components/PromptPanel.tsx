"use client";

import { useState } from "react";
import { Glass } from "./Glass";
import { NeonButton } from "./NeonButton";

interface PromptPanelProps {
  onRun: (prompt: string) => void;
  loading?: boolean;
}

const EXAMPLES = [
  "Build a Web3 trading dashboard",
  "Create a REST API for user management",
  "Generate a landing page for a SaaS product",
  "Run an arbitrage trade strategy on BASE",
];

export function PromptPanel({ onRun, loading = false }: PromptPanelProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = () => {
    if (prompt.trim() && !loading) {
      onRun(prompt.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <Glass className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/70 uppercase tracking-wider">
          Prompt
        </h2>
        <span className="text-xs text-white/30">⌘ + Enter to run</span>
      </div>

      <textarea
        className="w-full bg-transparent text-white placeholder-white/30 outline-none resize-none text-sm leading-relaxed min-h-[80px]"
        placeholder="Describe what you want to build..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
      />

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((example) => (
          <button
            key={example}
            onClick={() => setPrompt(example)}
            className="text-xs text-white/40 hover:text-white/70 border border-white/10 rounded-lg px-2 py-1 transition-colors"
          >
            {example}
          </button>
        ))}
      </div>

      <div className="flex gap-2 pt-1">
        <NeonButton onClick={handleSubmit} disabled={loading || !prompt.trim()}>
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Running...
            </span>
          ) : (
            "▶ Run"
          )}
        </NeonButton>
        <NeonButton
          variant="secondary"
          onClick={() => setPrompt("")}
          disabled={loading}
        >
          Clear
        </NeonButton>
      </div>
    </Glass>
  );
}
