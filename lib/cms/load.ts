import { DEFAULT_SITE_CONFIG } from "@/lib/cms/defaults";
import type { SiteConfig } from "@/lib/cms/types";

/**
 * Env-only check (no Firebase SDK import) so the public bundle can decide
 * whether to even attempt a Firestore fetch. NEXT_PUBLIC_* vars are inlined
 * by Next.js at build time.
 */
export function isFirebaseEnvConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
      process.env.NEXT_PUBLIC_FIREBASE_APP_ID
  );
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Deep merge: objects merge key-by-key, arrays and scalars are replaced. */
function mergeValues(base: unknown, patch: unknown): unknown {
  if (Array.isArray(base)) return Array.isArray(patch) ? patch : base;
  if (isPlainObject(base) && isPlainObject(patch)) {
    const out: Record<string, unknown> = { ...base };
    for (const [key, patchValue] of Object.entries(patch)) {
      if (patchValue === undefined) continue;
      out[key] = mergeValues(base[key], patchValue);
    }
    return out;
  }
  return patch === undefined ? base : patch;
}

/**
 * Merges a (possibly partial) stored document over the defaults so that
 * fields added in future releases never render as `undefined`.
 */
export function mergeSiteConfig(
  base: SiteConfig,
  patch: Partial<SiteConfig> | null | undefined
): SiteConfig {
  if (!patch) return base;
  const out: Record<string, unknown> = { ...base };
  for (const [key, patchValue] of Object.entries(patch)) {
    if (patchValue === undefined) continue;
    out[key] = mergeValues((base as Record<string, unknown>)[key], patchValue);
  }
  const merged = out as SiteConfig;
  const known = new Set(merged.sections.map((section) => section.id));
  const missing = DEFAULT_SITE_CONFIG.sections.filter((section) => !known.has(section.id));
  if (missing.length > 0) {
    const nextOrder = merged.sections.reduce((max, section) => Math.max(max, section.order), -1) + 1;
    merged.sections = [
      ...merged.sections,
      ...missing.map((section, index) => ({ ...section, order: nextOrder + index })),
    ];
  }
  return merged;
}

/**
 * Loads the public site configuration from Firestore.
 * Firebase is imported dynamically so visitors never download the SDK when
 * the project isn't configured. Returns null (→ defaults) on any failure.
 */
export async function loadSiteConfig(): Promise<Partial<SiteConfig> | null> {
  if (!isFirebaseEnvConfigured()) return null;
  try {
    const [client, firestore] = await Promise.all([
      import("@/lib/firebase/client"),
      import("firebase/firestore"),
    ]);
    const app = client.getFirebaseApp();
    if (!app) return null;
    const snapshot = await firestore.getDoc(
      firestore.doc(firestore.getFirestore(app), "siteConfig", "main")
    );
    return snapshot.exists() ? (snapshot.data() as Partial<SiteConfig>) : null;
  } catch {
    /* Network/rule error → the site simply keeps rendering the defaults. */
    return null;
  }
}

/* ── Server-side loading (SSR / ISR) ─────────────────────────────────────── */

type FirestoreRaw = {
  nullValue?: null;
  booleanValue?: boolean;
  integerValue?: string | number;
  doubleValue?: number;
  stringValue?: string;
  timestampValue?: string;
  mapValue?: { fields?: Record<string, FirestoreRaw> };
  arrayValue?: { values?: FirestoreRaw[] };
};

function decodeFirestoreValue(value: FirestoreRaw | undefined): unknown {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("mapValue" in value) {
    const out: Record<string, unknown> = {};
    for (const [key, child] of Object.entries(value.mapValue?.fields ?? {})) {
      out[key] = decodeFirestoreValue(child);
    }
    return out;
  }
  if ("arrayValue" in value) {
    return (value.arrayValue?.values ?? []).map(decodeFirestoreValue);
  }
  return null;
}

function firestoreDocUrl(): string | null {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!apiKey || !projectId) return null;
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/siteConfig/main?key=${apiKey}`;
}

/**
 * Server-side read of the CMS document, cached with ISR (revalidate: 60s).
 * Never throws and never blocks longer than 5s: any failure → null → the page
 * renders the shipped defaults. This is what makes the public page
 * genuinely CMS-driven even when the client fetch would fail.
 */
export async function getSiteConfigServer(): Promise<Partial<SiteConfig> | null> {
  const url = firestoreDocUrl();
  if (!url) return null;
  try {
    const res = await fetch(url, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { fields?: Record<string, FirestoreRaw> };
    if (!json.fields) return null;
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(json.fields)) {
      out[key] = decodeFirestoreValue(value);
    }
    return out as Partial<SiteConfig>;
  } catch {
    return null;
  }
}

export type FirestoreBackendStatus =
  | "ok"
  | "no-document"
  | "api-disabled"
  | "denied"
  | "unreachable";

/**
 * Fast (≤4s) backend diagnostic for the admin dashboard, so the panel can
 * tell the admin exactly what is broken instead of failing silently.
 */
export async function checkFirestoreBackend(): Promise<FirestoreBackendStatus> {
  const url = firestoreDocUrl();
  if (!url) return "unreachable";
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) return "ok";
    if (res.status === 404) return "no-document";
    const body = await res.text();
    if (body.includes("SERVICE_DISABLED") || body.includes("has not been used")) {
      return "api-disabled";
    }
    if (res.status === 403) return "denied";
    return "unreachable";
  } catch {
    return "unreachable";
  }
}
