"use client";

import { useEffect, useMemo, useState } from "react";

export interface CommandAction {
  id: string;
  label: string;
  shortcut?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  commands: CommandAction[];
}

export function CommandPalette({ open, onClose, commands }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(
    () => commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query],
  );

  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-24 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0d1117] p-3 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Global command palette"
        onClick={(event) => event.stopPropagation()}
      >
        <input
          autoFocus
          type="text"
          className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-purple-400"
          placeholder="Type a command..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Escape") onClose();
          }}
        />
        <div className="mt-3 max-h-72 overflow-auto">
          {filtered.length === 0 ? (
            <p className="state-message p-3 text-sm">No matching command</p>
          ) : (
            filtered.map((command) => (
              <button
                key={command.id}
                type="button"
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-white/80 hover:bg-white/10"
                onClick={() => {
                  command.run();
                  onClose();
                }}
              >
                <span>{command.label}</span>
                {command.shortcut ? <span className="text-xs text-white/40">{command.shortcut}</span> : null}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
