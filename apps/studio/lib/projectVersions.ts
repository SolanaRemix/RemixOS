import type { OutputTab, WorkspaceResult } from "@/hooks/useWorkspaceState";

export interface ProjectSnapshot {
  promptDraft: string;
  outputTab: OutputTab;
  result: WorkspaceResult;
}

export type ProjectVersionKind = "named" | "auto" | "safety";
export type VersionFilter = "all" | "named" | "auto";
export type DiffStatus = "added" | "modified" | "deleted" | "unchanged";
export type DiffLineType = "context" | "add" | "delete";
export type DiffViewMode = "side-by-side" | "unified";

export interface ProjectVersion {
  id: string;
  kind: ProjectVersionKind;
  name: string;
  description: string;
  author: string;
  createdAt: string;
  gitRef: string | null;
  snapshot: ProjectSnapshot;
}

export interface VersionDiffSection {
  id: string;
  label: string;
  before: string;
  after: string;
  status: DiffStatus;
}

export interface DiffLine {
  type: DiffLineType;
  value: string;
}

interface CreateProjectVersionOptions {
  customName?: string;
  description?: string;
  kind?: ProjectVersionKind;
  gitRef?: string | null;
  author?: string;
  createdAt?: string;
}

interface SnapshotFile {
  id: string;
  label: string;
  value: string;
}

const DEFAULT_AUTHOR = "Local workspace";
const MAX_PRECISE_DIFF_LINES = 160;
const MAX_PRECISE_DIFF_CHARS = 24000;
const MAX_PREVIEW_LINES = 40;
const MAX_PREVIEW_CHARS = 4000;
export const MAX_PROJECT_VERSIONS = 12;
let fallbackVersionCounter = 0;

function truncatePreview(text: string): string {
  const lines = text.split("\n").slice(0, MAX_PREVIEW_LINES);
  const preview = lines.join("\n").slice(0, MAX_PREVIEW_CHARS);
  return preview.length < text.length ? `${preview}\n… truncated for performance` : preview;
}

export function sanitizeWorkspaceResult(result: WorkspaceResult): WorkspaceResult {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return null;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(result)) {
    if (key === "build" && value && typeof value === "object") {
      const build = value as Record<string, unknown>;
      const html = typeof build["html"] === "string" ? build["html"] : undefined;
      const code = typeof build["code"] === "string" ? build["code"] : undefined;

      if (html || code) {
        sanitized[key] = {
          ...(html ? { html } : {}),
          ...(code ? { code } : {}),
        };
      }
      continue;
    }

    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      sanitized[key] = value;
    }
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null;
}

export function sanitizeProjectSnapshot(snapshot: ProjectSnapshot): ProjectSnapshot {
  return {
    promptDraft: snapshot.promptDraft,
    outputTab: snapshot.outputTab,
    result: sanitizeWorkspaceResult(snapshot.result),
  };
}

export function pruneVersions<T>(versions: T[], maxVersions = MAX_PROJECT_VERSIONS): T[] {
  return versions.slice(0, maxVersions);
}

function cloneSnapshot(snapshot: ProjectSnapshot): ProjectSnapshot {
  const sanitized = sanitizeProjectSnapshot(snapshot);
  if (typeof structuredClone === "function") {
    return structuredClone(sanitized);
  }

  return JSON.parse(JSON.stringify(sanitized)) as ProjectSnapshot;
}

function formatTimestamp(createdAt: string): string {
  return new Date(createdAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getBuildField(result: WorkspaceResult, field: string): string {
  if (!result || typeof result !== "object") {
    return "";
  }

  const build = result["build"];
  if (!build || typeof build !== "object") {
    return "";
  }

  const value = (build as Record<string, unknown>)[field];
  return typeof value === "string" ? value : "";
}

function getSnapshotFiles(snapshot: ProjectSnapshot): SnapshotFile[] {
  return [
    {
      id: "prompt",
      label: "Prompt",
      value: snapshot.promptDraft.trim(),
    },
    {
      id: "generated-code",
      label: "Generated React code",
      value: getBuildField(snapshot.result, "code").trim(),
    },
    {
      id: "generated-html",
      label: "Canvas / preview HTML",
      value: getBuildField(snapshot.result, "html").trim(),
    },
    {
      id: "project-json",
      label: "Project JSON",
      value: snapshot.result ? JSON.stringify(snapshot.result, null, 2) : "",
    },
  ];
}

export function getVersionBadge(kind: ProjectVersionKind): string {
  if (kind === "named") {
    return "Named";
  }
  if (kind === "safety") {
    return "Safety";
  }
  return "Auto";
}

export function createProjectVersion(
  snapshot: ProjectSnapshot,
  {
    customName,
    description,
    kind = customName?.trim() ? "named" : "auto",
    gitRef = null,
    author = DEFAULT_AUTHOR,
    createdAt = new Date().toISOString(),
  }: CreateProjectVersionOptions = {},
): ProjectVersion {
  const versionId = typeof globalThis.crypto?.randomUUID === "function"
    ? globalThis.crypto.randomUUID()
    : `${createdAt}-${fallbackVersionCounter += 1}`;

  return {
    id: versionId,
    kind,
    name: customName?.trim() || `${kind === "safety" ? "Pre-revert" : "Snapshot"} · ${formatTimestamp(createdAt)}`,
    description: description?.trim() || (kind === "safety" ? "Automatic safety snapshot created before revert." : ""),
    author,
    createdAt,
    gitRef,
    snapshot: cloneSnapshot(snapshot),
  };
}

export function getDiffSections(previous: ProjectSnapshot, next: ProjectSnapshot): VersionDiffSection[] {
  const previousFiles = getSnapshotFiles(previous);
  const nextFiles = getSnapshotFiles(next);

  return previousFiles.map((file, index) => {
    const nextFile = nextFiles[index];
    const before = file.value;
    const after = nextFile?.value ?? "";
    let status: DiffStatus = "unchanged";

    if (!before && after) {
      status = "added";
    } else if (before && !after) {
      status = "deleted";
    } else if (before !== after) {
      status = "modified";
    }

    return {
      id: file.id,
      label: file.label,
      before,
      after,
      status,
    };
  });
}

export function matchesVersionFilter(version: ProjectVersion, filter: VersionFilter, query: string): boolean {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesQuery = !normalizedQuery
    || version.name.toLowerCase().includes(normalizedQuery)
    || version.description.toLowerCase().includes(normalizedQuery);

  if (!matchesQuery) {
    return false;
  }

  if (filter === "named") {
    return version.kind === "named";
  }

  if (filter === "auto") {
    return version.kind !== "named";
  }

  return true;
}

export function formatVersionDate(createdAt: string): string {
  return new Date(createdAt).toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function computeLineDiff(before: string, after: string): DiffLine[] {
  const left = before.split("\n");
  const right = after.split("\n");

  if (
    left.length > MAX_PRECISE_DIFF_LINES
    || right.length > MAX_PRECISE_DIFF_LINES
    || before.length > MAX_PRECISE_DIFF_CHARS
    || after.length > MAX_PRECISE_DIFF_CHARS
  ) {
    return [
      {
        type: "context",
        value: "Diff too large for precise rendering. Showing truncated previews instead.",
      },
      ...(before ? [{ type: "delete" as const, value: truncatePreview(before) }] : []),
      ...(after ? [{ type: "add" as const, value: truncatePreview(after) }] : []),
    ];
  }

  const dp = Array.from({ length: left.length + 1 }, () => Array<number>(right.length + 1).fill(0));

  for (let i = left.length - 1; i >= 0; i -= 1) {
    for (let j = right.length - 1; j >= 0; j -= 1) {
      const nextDiagonal = dp[i + 1]?.[j + 1] ?? 0;
      const nextDown = dp[i + 1]?.[j] ?? 0;
      const nextRight = dp[i]?.[j + 1] ?? 0;

      const row = dp[i];
      if (!row) {
        continue;
      }

      row[j] = left[i] === right[j]
        ? nextDiagonal + 1
        : Math.max(nextDown, nextRight);
    }
  }

  const lines: DiffLine[] = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      lines.push({ type: "context", value: left[i] ?? "" });
      i += 1;
      j += 1;
      continue;
    }

    const nextDown = dp[i + 1]?.[j] ?? 0;
    const nextRight = dp[i]?.[j + 1] ?? 0;

    if (nextDown >= nextRight) {
      lines.push({ type: "delete", value: left[i] ?? "" });
      i += 1;
    } else {
      lines.push({ type: "add", value: right[j] ?? "" });
      j += 1;
    }
  }

  while (i < left.length) {
    lines.push({ type: "delete", value: left[i] ?? "" });
    i += 1;
  }

  while (j < right.length) {
    lines.push({ type: "add", value: right[j] ?? "" });
    j += 1;
  }

  return lines;
}
