"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

import type { FieldDef } from "@/lib/cms/registry";

export const inputCls =
  "w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#F5A623]/70";

export const labelCls =
  "mb-1.5 block font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/50";

/** Builds an empty value for a new object-list item based on its field defs. */
export function emptyItem(fields: FieldDef[]): Record<string, unknown> {
  const item: Record<string, unknown> = {};
  for (const field of fields) {
    switch (field.type) {
      case "string-list":
      case "object-list":
        item[field.key] = [];
        break;
      case "object":
        item[field.key] = emptyItem(field.fields);
        break;
      case "number":
        item[field.key] = 0;
        break;
      case "toggle":
        item[field.key] = false;
        break;
      default:
        item[field.key] = "";
    }
  }
  return item;
}

type FieldEditorProps = {
  field: FieldDef;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function FieldEditor({ field, value, onChange }: FieldEditorProps) {
  const help = "help" in field && field.help ? field.help : undefined;

  switch (field.type) {
    case "text":
    case "url":
    case "email":
      return (
        <div>
          <label className={labelCls}>{field.label}</label>
          <input
            type={field.type === "email" ? "email" : "text"}
            className={inputCls}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          {help && <p className="mt-1 text-xs text-white/35">{help}</p>}
        </div>
      );

    case "textarea":
      return (
        <div>
          <label className={labelCls}>{field.label}</label>
          <textarea
            className={`${inputCls} min-h-[80px] resize-y leading-relaxed`}
            rows={field.rows ?? 3}
            value={typeof value === "string" ? value : ""}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
          />
          {help && <p className="mt-1 text-xs text-white/35">{help}</p>}
        </div>
      );

    case "number":
      return (
        <div>
          <label className={labelCls}>{field.label}</label>
          <input
            type="number"
            step="any"
            className={inputCls}
            value={typeof value === "number" ? value : 0}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          {help && <p className="mt-1 text-xs text-white/35">{help}</p>}
        </div>
      );

    case "color": {
      const hex = typeof value === "string" && value ? value : "#000000";
      return (
        <div>
          <label className={labelCls}>{field.label}</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-9 w-12 shrink-0 cursor-pointer rounded-lg border border-white/10 bg-transparent"
              value={hex}
              onChange={(e) => onChange(e.target.value)}
            />
            <input
              type="text"
              className={inputCls}
              value={hex}
              onChange={(e) => onChange(e.target.value)}
            />
          </div>
          {help && <p className="mt-1 text-xs text-white/35">{help}</p>}
        </div>
      );
    }

    case "toggle":
      return (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <span className="text-sm text-white/80">{field.label}</span>
          <input
            type="checkbox"
            className="h-4 w-4 accent-[#F5A623]"
            checked={value === true}
            onChange={(e) => onChange(e.target.checked)}
          />
        </label>
      );

    case "string-list": {
      const items = Array.isArray(value) ? (value as string[]) : [];
      return (
        <div>
          <label className={labelCls}>{field.label}</label>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  className={inputCls}
                  value={item}
                  placeholder={field.placeholder}
                  onChange={(e) =>
                    onChange(items.map((v, i) => (i === index ? e.target.value : v)))
                  }
                />
                <button
                  type="button"
                  className="rounded-lg border border-white/10 p-2 text-white/40 transition hover:border-red-500/40 hover:text-red-400"
                  aria-label={`Remove ${field.label} item ${index + 1}`}
                  onClick={() => onChange(items.filter((_, i) => i !== index))}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {items.length === 0 && <p className="text-xs text-white/30">No items yet.</p>}
          </div>
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-[#F5A623]/60 hover:text-[#F5A623]"
            onClick={() => onChange([...items, ""])}
          >
            <Plus size={13} /> Add item
          </button>
          {help && <p className="mt-1 text-xs text-white/35">{help}</p>}
        </div>
      );
    }

    case "object": {
      const obj =
        typeof value === "object" && value !== null && !Array.isArray(value)
          ? (value as Record<string, unknown>)
          : {};
      return (
        <fieldset className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
          <legend className="px-1 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-white/50">
            {field.label}
          </legend>
          <div className="grid gap-3 pt-1">
            {field.fields.map((sub) => (
              <FieldEditor
                key={sub.key}
                field={sub}
                value={obj[sub.key]}
                onChange={(v) => onChange({ ...obj, [sub.key]: v })}
              />
            ))}
          </div>
          {help && <p className="mt-2 text-xs text-white/35">{help}</p>}
        </fieldset>
      );
    }

    case "object-list": {
      const items = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
      const titleKey = field.itemTitleKey ?? field.fields[0]?.key;
      const move = (index: number, dir: -1 | 1) => {
        const target = index + dir;
        if (target < 0 || target >= items.length) return;
        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
      };
      return (
        <div>
          <label className={labelCls}>{field.label}</label>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-[#F5A623]">
                    {String(item[titleKey] ?? "") || `Item ${index + 1}`}
                  </span>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      className="rounded-md border border-white/10 p-1.5 text-white/40 transition hover:text-white"
                      aria-label="Move up"
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ChevronUp size={13} />
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-white/10 p-1.5 text-white/40 transition hover:text-white"
                      aria-label="Move down"
                      disabled={index === items.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ChevronDown size={13} />
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-white/10 p-1.5 text-white/40 transition hover:border-red-500/40 hover:text-red-400"
                      aria-label="Remove item"
                      onClick={() => onChange(items.filter((_, i) => i !== index))}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="grid gap-3">
                  {field.fields.map((sub) => (
                    <FieldEditor
                      key={sub.key}
                      field={sub}
                      value={item[sub.key]}
                      onChange={(v) =>
                        onChange(
                          items.map((it, i) => (i === index ? { ...it, [sub.key]: v } : it))
                        )
                      }
                    />
                  ))}
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-xs text-white/30">No items yet.</p>}
          </div>
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-white/70 transition hover:border-[#F5A623]/60 hover:text-[#F5A623]"
            onClick={() => onChange([...items, emptyItem(field.fields)])}
          >
            <Plus size={13} /> {field.addLabel ?? "Add item"}
          </button>
          {help && <p className="mt-1 text-xs text-white/35">{help}</p>}
        </div>
      );
    }
  }
}

