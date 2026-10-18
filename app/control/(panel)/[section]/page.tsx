"use client";

import { notFound, useParams } from "next/navigation";

import { SectionEditor } from "@/components/control/section-editor";
import { getEditorSection } from "@/lib/cms/registry";

/**
 * Generic editor route: /control/<slug>.
 * Every entry in the editor registry (lib/cms/registry.tsx) automatically gets
 * a working page here — new editors are added by extending the registry only.
 */
export default function EditorPage() {
  const params = useParams<{ section: string }>();
  const def = getEditorSection(params.section);
  if (!def) notFound();
  return <SectionEditor def={def} />;
}
