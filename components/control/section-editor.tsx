"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Check, ChevronDown, ChevronUp, Eye, EyeOff, RotateCcw } from "lucide-react";
import Link from "next/link";

import { useSiteConfig } from "@/components/cms/site-config-provider";
import { FieldEditor } from "@/components/control/field-editor";
import { DEFAULT_SITE_CONFIG } from "@/lib/cms/defaults";
import type { EditorSectionDef } from "@/lib/cms/registry";
import type { SectionEntry, SiteConfigKey } from "@/lib/cms/types";

/** Custom editor: visibility toggles + drag-free reordering of page sections. */
export function SectionsEditor({
  value,
  onChange,
}: {
  value: SectionEntry[];
  onChange: (value: SectionEntry[]) => void;
}) {
  const move = (index: number, dir: -1 | 1) => {
    const target = index + dir;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next.map((entry, position) => ({ ...entry, order: position })));
  };
  const patch = (id: string, changes: Partial<SectionEntry>) =>
    onChange(value.map((entry) => (entry.id === id ? { ...entry, ...changes } : entry)));

  return (
    <div className="space-y-3">
      <p className="text-xs text-white/40">
        Sections render top-to-bottom in this order. Hidden sections are removed from the page
        entirely (their nav links become inactive).
      </p>
      {value.map((entry, index) => (
        <div
          key={entry.id}
          className={`flex items-center gap-3 rounded-xl border bg-white/[0.03] px-4 py-3 ${
            entry.visible ? "border-white/10" : "border-white/5 opacity-50"
          }`}
        >
          <span className="font-mono text-xs text-white/30">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm text-white">{entry.label}</p>
            <p className="font-mono text-[0.65rem] uppercase tracking-widest text-white/30">
              #{entry.id}
            </p>
          </div>
          <button
            type="button"
            className="rounded-md border border-white/10 p-1.5 text-white/40 transition hover:text-white"
            aria-label={`Toggle divider after ${entry.label}`}
            title={entry.dividerAfter ? "Divider line after: on" : "Divider line after: off"}
            onClick={() => patch(entry.id, { dividerAfter: !entry.dividerAfter })}
          >
            <span className="block h-px w-4 bg-current" />
          </button>
          <button
            type="button"
            className="rounded-md border border-white/10 p-1.5 text-white/40 transition hover:text-white"
            aria-label={entry.visible ? `Hide ${entry.label}` : `Show ${entry.label}`}
            onClick={() => patch(entry.id, { visible: !entry.visible })}
          >
            {entry.visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            type="button"
            className="rounded-md border border-white/10 p-1.5 text-white/40 transition hover:text-white disabled:opacity-30"
            aria-label={`Move ${entry.label} up`}
            disabled={index === 0}
            onClick={() => move(index, -1)}
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            className="rounded-md border border-white/10 p-1.5 text-white/40 transition hover:text-white disabled:opacity-30"
            aria-label={`Move ${entry.label} down`}
            disabled={index === value.length - 1}
            onClick={() => move(index, 1)}
          >
            <ChevronDown size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

type Status = "idle" | "saving" | "saved" | "error";

export function SectionEditor({ def }: { def: EditorSectionDef }) {
  const { config, saveSection } = useSiteConfig();
  const key = def.id as SiteConfigKey;
  const stored = config[key];
  const defaultValue = DEFAULT_SITE_CONFIG[key];

  const [draft, setDraft] = useState<unknown>(stored);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);

  /* Re-sync the draft whenever the stored config changes (initial load or an
     update from another tab) — but never while there are local edits. */
  const [dirty, setDirty] = useState(false);
  useEffect(() => {
    if (!dirty) setDraft(stored);
  }, [stored, dirty]);

  const handleSave = async () => {
    setStatus("saving");
    setError(null);
    try {
      await saveSection(key, draft as never);
      setDirty(false);
      setStatus("saved");
      window.setTimeout(() => setStatus("idle"), 2500);
    } catch (err) {
      setStatus("error");
      const message = err instanceof Error ? err.message : "Saving failed.";
      setError(
        /permission-denied|insufficient permissions/i.test(message)
          ? "Firestore refused the write — the Firestore API/database is not enabled yet, or firestore.rules isn't published. Enable Firestore in the Firebase console (Create database), then publish firestore.rules."
          : message
      );
    }
  };

  const handleReset = () => {
    setDraft(JSON.parse(JSON.stringify(defaultValue)) as unknown);
    setDirty(true);
    setStatus("idle");
    setError(null);
  };

  const set = (value: unknown) => {
    setDraft(value);
    setDirty(true);
    setStatus("idle");
    setError(null);
  };

  const draftObject =
    typeof draft === "object" && draft !== null && !Array.isArray(draft)
      ? (draft as Record<string, unknown>)
      : {};

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 lg:px-10">
      <Link
        href="/control"
        className="inline-flex items-center gap-1.5 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-white/40 transition hover:text-[#F5A623]"
      >
        <ArrowLeft size={13} /> Dashboard
      </Link>

      <header className="mt-5 border-b border-white/10 pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <def.icon size={20} className="text-[#F5A623]" />
          <h1 className="text-2xl font-semibold text-white">{def.title}</h1>
          {def.badge && (
            <span className="rounded-full border border-white/15 px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-widest text-white/50">
              {def.badge}
            </span>
          )}
        </div>
        <p className="mt-2 max-w-xl text-sm text-white/45">{def.description}</p>
      </header>

      <div className="mt-6 grid gap-5">
        {def.custom === "sections" ? (
          <SectionsEditor
            value={Array.isArray(draft) ? (draft as SectionEntry[]) : []}
            onChange={set}
          />
        ) : (
          (def.fields ?? []).map((field) => (
            <FieldEditor
              key={field.key}
              field={field}
              value={draftObject[field.key]}
              onChange={(v) => set({ ...draftObject, [field.key]: v })}
            />
          ))
        )}
      </div>

      <div className="sticky bottom-6 mt-8 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#0F0F10]/95 px-4 py-3 shadow-lg backdrop-blur">
        <button
          type="button"
          onClick={handleSave}
          disabled={!dirty || status === "saving"}
          className="inline-flex items-center gap-2 rounded-lg bg-[#F5A623] px-4 py-2 text-sm font-medium text-[#0C0C0C] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "saved" && <Check size={15} />}
          {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-2 text-xs text-white/60 transition hover:text-white"
        >
          <RotateCcw size={13} /> Reset to defaults
        </button>
        {dirty && status !== "saving" && status !== "saved" && (
          <span className="text-xs text-white/40">Unsaved changes</span>
        )}
        {status === "error" && <span className="text-xs text-red-400">{error}</span>}
      </div>
    </div>
  );
}

