"use client";

import { useEffect, useMemo, useState } from "react";
import { Glass } from "./Glass";
import { NeonButton } from "./NeonButton";
import {
  computeLineDiff,
  formatVersionDate,
  getDiffSections,
  getVersionBadge,
  matchesVersionFilter,
  type DiffLine,
  type DiffViewMode,
  type ProjectSnapshot,
  type ProjectVersionKind,
  type ProjectVersion,
  type VersionDiffSection,
  type VersionFilter,
} from "@/lib/projectVersions";

interface ProjectVersionsPanelProps {
  currentSnapshot: ProjectSnapshot;
  versions: ProjectVersion[];
  onCreateVersion: (options?: { customName?: string; description?: string; kind?: "named" | "auto" | "safety" }) => void;
  onUpdateVersion: (versionId: string, patch: { name?: string; description?: string }) => void;
  onRevertVersion: (version: ProjectVersion) => void;
}

interface SideBySideRow {
  id: string;
  kind: "context" | "change" | "add" | "delete";
  left?: string;
  right?: string;
}

const FILTERS: VersionFilter[] = ["all", "named", "auto"];

function getStatusClass(status: VersionDiffSection["status"]): string {
  if (status === "added") return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
  if (status === "deleted") return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  if (status === "modified") return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  return "bg-white/5 text-white/55 border-white/10";
}

function getStatusLabel(status: VersionDiffSection["status"]): string {
  if (status === "added") return "Added";
  if (status === "deleted") return "Deleted";
  if (status === "modified") return "Modified";
  return "Unchanged";
}

function getVersionKindBadgeClass(kind: ProjectVersionKind): string {
  if (kind === "named") {
    return "bg-amber-500/15 text-amber-200 border-amber-400/30";
  }

  if (kind === "safety") {
    return "bg-rose-500/15 text-rose-200 border-rose-400/30";
  }

  return "bg-emerald-500/15 text-emerald-200 border-emerald-400/30";
}

function toSideBySideRows(lines: DiffLine[]): SideBySideRow[] {
  const rows: SideBySideRow[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];

    if (!line) {
      continue;
    }

    if (line.type === "context") {
      rows.push({ id: `context-${index}`, kind: "context", left: line.value, right: line.value });
      continue;
    }

    const next = lines[index + 1];
    if (line.type === "delete" && next?.type === "add") {
      rows.push({ id: `change-${index}`, kind: "change", left: line.value, right: next.value });
      index += 1;
      continue;
    }

    if (line.type === "delete") {
      rows.push({ id: `delete-${index}`, kind: "delete", left: line.value });
      continue;
    }

    rows.push({ id: `add-${index}`, kind: "add", right: line.value });
  }

  return rows;
}

function VersionMetadataEditor({
  version,
  onSelect,
  onUpdateVersion,
}: {
  version: ProjectVersion;
  onSelect: () => void;
  onUpdateVersion: (versionId: string, patch: { name?: string; description?: string }) => void;
}) {
  const [nameDraft, setNameDraft] = useState(version.name);
  const [descriptionDraft, setDescriptionDraft] = useState(version.description);

  useEffect(() => {
    setNameDraft(version.name);
    setDescriptionDraft(version.description);
  }, [version.description, version.id, version.name]);

  const commitChanges = () => {
    const patch: { name?: string; description?: string } = {};

    if (nameDraft !== version.name) {
      patch.name = nameDraft;
    }

    if (descriptionDraft !== version.description) {
      patch.description = descriptionDraft;
    }

    if (Object.keys(patch).length > 0) {
      onUpdateVersion(version.id, patch);
    }
  };

  return (
    <div className="mt-3 space-y-2">
      <input
        type="text"
        value={nameDraft}
        onFocus={onSelect}
        onChange={(event) => setNameDraft(event.target.value)}
        onBlur={commitChanges}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            commitChanges();
          }
        }}
        className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
      />
      <textarea
        value={descriptionDraft}
        onFocus={onSelect}
        onChange={(event) => setDescriptionDraft(event.target.value)}
        onBlur={commitChanges}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            commitChanges();
          }
        }}
        placeholder="Add a description"
        rows={2}
        className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
      />
      <div className="grid gap-1 text-xs text-white/45 sm:grid-cols-3">
        <span>Author: {version.author}</span>
        <span>Git ref: {version.gitRef ?? "Not linked"}</span>
        <span>Snapshot: immutable</span>
      </div>
    </div>
  );
}

function DiffContent({ section, viewMode }: { section: VersionDiffSection; viewMode: DiffViewMode }) {
  const lines = useMemo(() => computeLineDiff(section.before, section.after), [section.after, section.before]);
  const rows = useMemo(() => toSideBySideRows(lines), [lines]);

  if (!section.before && !section.after) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">
        No content in either snapshot for this section.
      </div>
    );
  }

  if (viewMode === "unified") {
    return (
      <div className="overflow-auto rounded-2xl border border-white/10 bg-black/20">
        <div className="min-w-full p-4 font-mono text-xs leading-6 text-white/75 whitespace-pre-wrap break-words">
          {lines.map((line, index) => (
            <div
              key={`diff-line-${index}`}
              className={
                line.type === "add"
                  ? "bg-emerald-500/10 text-emerald-200"
                  : line.type === "delete"
                    ? "bg-rose-500/10 text-rose-200"
                    : "text-white/70"
              }
            >
              <span className="mr-3 inline-block w-4 text-center">
                {line.type === "add" ? "+" : line.type === "delete" ? "-" : " "}
              </span>
              {line.value || " "}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-2xl border border-white/10 bg-black/20">
      <div className="grid min-w-[720px] grid-cols-2 border-b border-white/10 text-xs uppercase tracking-[0.2em] text-white/35">
        <div className="border-r border-white/10 px-4 py-3">Selected version</div>
        <div className="px-4 py-3">Current workspace</div>
      </div>
      <div className="min-w-[720px] font-mono text-xs leading-6 whitespace-pre-wrap break-words">
        {rows.map((row) => (
          <div key={row.id} className="grid grid-cols-2">
            <div
              className={`border-r border-white/10 px-4 py-1.5 whitespace-pre-wrap break-words ${
                row.kind === "change" || row.kind === "delete" ? "bg-rose-500/10 text-rose-100" : "text-white/70"
              }`}
            >
              {row.left || " "}
            </div>
            <div
              className={`px-4 py-1.5 whitespace-pre-wrap break-words ${
                row.kind === "change" || row.kind === "add" ? "bg-emerald-500/10 text-emerald-100" : "text-white/70"
              }`}
            >
              {row.right || " "}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProjectVersionsPanel({
  currentSnapshot,
  versions,
  onCreateVersion,
  onUpdateVersion,
  onRevertVersion,
}: ProjectVersionsPanelProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<VersionFilter>("all");
  const [diffViewMode, setDiffViewMode] = useState<DiffViewMode>("side-by-side");
  const [draftName, setDraftName] = useState("");
  const [draftDescription, setDraftDescription] = useState("");
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(versions[0]?.id ?? null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [revertTargetId, setRevertTargetId] = useState<string | null>(null);

  const sortedVersions = useMemo(
    () => [...versions].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [versions],
  );
  const filteredVersions = useMemo(
    () => sortedVersions.filter((version) => matchesVersionFilter(version, filter, query)),
    [filter, query, sortedVersions],
  );
  const selectedVersion = filteredVersions.find((version) => version.id === selectedVersionId) ?? filteredVersions[0] ?? null;
  const diffSections = useMemo(
    () => selectedVersion ? getDiffSections(selectedVersion.snapshot, currentSnapshot) : [],
    [currentSnapshot, selectedVersion],
  );
  const selectedSection = diffSections.find((section) => section.id === selectedSectionId)
    ?? diffSections.find((section) => section.status !== "unchanged")
    ?? diffSections[0]
    ?? null;
  const revertTarget = sortedVersions.find((version) => version.id === revertTargetId) ?? null;
  const revertSections = useMemo(
    () => revertTarget ? getDiffSections(currentSnapshot, revertTarget.snapshot) : [],
    [currentSnapshot, revertTarget],
  );

  return (
    <div className="space-y-4">
      <Glass className="space-y-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-white/70">Project Versions</h2>
            <p className="mt-2 text-sm text-white/55">
              Save immutable project snapshots, inspect visual diffs, and safely revert with an automatic pre-revert backup.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,220px)_minmax(0,280px)_auto]">
            <input
              type="text"
              value={draftName}
              onChange={(event) => setDraftName(event.target.value)}
              placeholder="Optional version name"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
            />
            <input
              type="text"
              value={draftDescription}
              onChange={(event) => setDraftDescription(event.target.value)}
              placeholder="Description"
              className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
            />
            <NeonButton
              onClick={() => {
                onCreateVersion({
                  customName: draftName,
                  description: draftDescription,
                });
                setDraftName("");
                setDraftDescription("");
              }}
            >
              Save version
            </NeonButton>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1.45fr)]">
          <div className="space-y-3">
            <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/10 p-3">
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search version name or description"
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-sky-400"
              />
              <div className="flex flex-wrap gap-2">
                {FILTERS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFilter(value)}
                    className={`rounded-full border px-3 py-1 text-xs capitalize transition-colors ${
                      filter === value
                        ? "border-sky-400/50 bg-sky-500/15 text-sky-100"
                        : "border-white/10 text-white/55 hover:text-white"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-[680px] space-y-3 overflow-auto pr-1">
              {filteredVersions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">
                  No versions match the current filters.
                </div>
              ) : (
                filteredVersions.map((version) => {
                  const isSelected = version.id === selectedVersion?.id;
                  return (
                    <div
                      key={version.id}
                      className={`rounded-2xl border p-3 transition-colors ${
                        isSelected ? "border-sky-400/40 bg-sky-500/10" : "border-white/10 bg-black/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              aria-label={`Version type: ${getVersionBadge(version.kind)}`}
                              className={`rounded-full border px-2 py-0.5 text-[11px] ${getVersionKindBadgeClass(version.kind)}`}
                            >
                              {getVersionBadge(version.kind)}
                            </span>
                            <span className="text-xs text-white/45">{formatVersionDate(version.createdAt)}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedVersionId(version.id)}
                            className="text-left text-sm font-semibold text-white hover:text-sky-200"
                          >
                            Inspect diff
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <NeonButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setSelectedVersionId(version.id)}>
                            Preview
                          </NeonButton>
                          <NeonButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setRevertTargetId(version.id)}>
                            Revert
                          </NeonButton>
                        </div>
                      </div>

                      <VersionMetadataEditor
                        version={version}
                        onSelect={() => setSelectedVersionId(version.id)}
                        onUpdateVersion={onUpdateVersion}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/10 p-3">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/35">Diff viewer</p>
                <h3 className="mt-1 text-sm font-semibold text-white">
                  {selectedVersion ? selectedVersion.name : "Select a version"}
                </h3>
                <p className="mt-1 text-xs text-white/45">
                  Comparing the selected version against your current workspace state.
                </p>
              </div>
              <div className="flex gap-2">
                {(["side-by-side", "unified"] as DiffViewMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDiffViewMode(mode)}
                    className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                      diffViewMode === mode
                        ? "border-sky-400/50 bg-sky-500/15 text-sky-100"
                        : "border-white/10 text-white/55 hover:text-white"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {selectedVersion ? (
              <>
                <div className="grid gap-2 xl:grid-cols-[220px_minmax(0,1fr)]">
                  <div className="space-y-2">
                    {diffSections.map((section) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setSelectedSectionId(section.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left transition-colors ${
                          selectedSection?.id === section.id
                            ? "border-sky-400/40 bg-sky-500/10"
                            : "border-white/10 bg-black/10"
                        }`}
                      >
                        <span className="text-sm text-white">{section.label}</span>
                        <span className={`rounded-full border px-2 py-0.5 text-[11px] ${getStatusClass(section.status)}`}>
                          {getStatusLabel(section.status)}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-2xl border border-white/10 bg-black/10 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{selectedSection?.label ?? "No section selected"}</p>
                          <p className="mt-1 text-xs text-white/45">
                            {selectedSection ? `${getStatusLabel(selectedSection.status)} between selected version and current workspace.` : "Choose a section to inspect the diff."}
                          </p>
                        </div>
                        {selectedVersion ? (
                          <NeonButton variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => setRevertTargetId(selectedVersion.id)}>
                            Revert to this version
                          </NeonButton>
                        ) : null}
                      </div>
                    </div>
                    {selectedSection ? <DiffContent section={selectedSection} viewMode={diffViewMode} /> : null}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-white/45">
                Save a version to start inspecting diffs and reverting safely.
              </div>
            )}
          </div>
        </div>
      </Glass>

      {revertTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-3xl rounded-3xl border border-white/15 bg-[#0d1117] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-rose-200/70">Safe revert</p>
                <h3 className="mt-2 text-lg font-semibold text-white">Revert to {revertTarget.name}?</h3>
                <p className="mt-2 text-sm text-white/60">
                  RemixOS will create a pre-revert safety snapshot first, then restore this version.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close revert dialog"
                onClick={() => setRevertTargetId(null)}
                className="text-white/45 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {revertSections.map((section) => (
                <div key={section.id} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-white">{section.label}</span>
                    <span className={`rounded-full border px-2 py-0.5 text-[11px] ${getStatusClass(section.status)}`}>
                      {getStatusLabel(section.status)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <NeonButton variant="secondary" onClick={() => setRevertTargetId(null)}>
                Cancel
              </NeonButton>
              <NeonButton
                onClick={() => {
                  onRevertVersion(revertTarget);
                  setRevertTargetId(null);
                }}
              >
                Confirm revert
              </NeonButton>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
