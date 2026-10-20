"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { DEFAULT_SITE_CONFIG } from "@/lib/cms/defaults";
import { mergeSiteConfig } from "@/lib/cms/load";
import type { SiteConfig, SiteConfigKey } from "@/lib/cms/types";

type SiteConfigContextValue = {
  /** Effective config: defaults deep-merged with the Firestore document. */
  config: SiteConfig;
  /** True once the initial Firestore load attempt has finished. */
  loaded: boolean;
  /** Where the current content comes from. */
  source: "firestore" | "defaults";
  /** Persists one top-level section to Firestore and updates local state. */
  saveSection: <K extends SiteConfigKey>(key: K, value: SiteConfig[K]) => Promise<void>;
};

const SiteConfigContext = createContext<SiteConfigContextValue | null>(null);

type SiteConfigProviderProps = {
  children: ReactNode;
  /** Server-rendered config (ISR, refreshed every 60s) — no hydration flash. */
  initialConfig?: SiteConfig;
  initialSource?: "firestore" | "defaults";
};

/**
 * App-wide site configuration.
 * 1. Seeds from the server-rendered config (SSR/ISR — the public page HTML
 *    already contains CMS content, so the site is CMS-driven even if the
 *    client-side fetch fails).
 * 2. Subscribes to `siteConfig/main` with onSnapshot, so every admin save
 *    appears live on open tabs instantly — no refresh needed.
 * 3. Falls back to DEFAULT_SITE_CONFIG everywhere else (never breaks).
 */
export function SiteConfigProvider({
  children,
  initialConfig,
  initialSource,
}: SiteConfigProviderProps) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig ?? DEFAULT_SITE_CONFIG);
  const [loaded, setLoaded] = useState(true);
  const [source, setSource] = useState<"firestore" | "defaults">(initialSource ?? "defaults");

  /* Live subscription — replaces the old one-shot fetch. */
  useEffect(() => {
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    (async () => {
      try {
        const [client, firestore] = await Promise.all([
          import("@/lib/firebase/client"),
          import("firebase/firestore"),
        ]);
        const app = client.getFirebaseApp();
        if (!app || cancelled) return;
        unsubscribe = firestore.onSnapshot(
          firestore.doc(firestore.getFirestore(app), "siteConfig", "main"),
          (snapshot) => {
            if (cancelled || !snapshot.exists()) return;
            setConfig(mergeSiteConfig(DEFAULT_SITE_CONFIG, snapshot.data() as Partial<SiteConfig>));
            setSource("firestore");
            setLoaded(true);
          },
          () => {
            /* Read denied/unreachable → keep whatever we already render. */
            if (!cancelled) setLoaded(true);
          }
        );
      } catch {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, []);

  const saveSection = useCallback(async (key: SiteConfigKey, value: unknown) => {
    const [client, firestore, auth] = await Promise.all([
      import("@/lib/firebase/client"),
      import("firebase/firestore"),
      import("firebase/auth"),
    ]);
    const app = client.getFirebaseApp();
    if (!app) {
      throw new Error(
        "Firebase is not configured. Add the NEXT_PUBLIC_FIREBASE_* variables to .env.local first."
      );
    }
    /* Fail fast: a disabled/blocked Firestore must not hang the Save button. */
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
      timer = setTimeout(
        () =>
          reject(
            new Error(
              "Saving timed out after 10s. Firestore is likely disabled or unreachable — check the Dashboard status and enable the Firestore API in the Firebase console."
            )
          ),
        10_000
      );
    });
    try {
      await Promise.race([
        firestore.setDoc(
          firestore.doc(firestore.getFirestore(app), "siteConfig", "main"),
          {
            [key]: value,
            updatedAt: firestore.serverTimestamp(),
            updatedBy: auth.getAuth(app).currentUser?.email ?? null,
          },
          { merge: true }
        ),
        timeout,
      ]);
    } finally {
      clearTimeout(timer);
    }
    setConfig((prev) => ({ ...prev, [key]: value }) as SiteConfig);
  }, []);

  const value = useMemo(
    () => ({ config, loaded, source, saveSection }),
    [config, loaded, source, saveSection]
  );

  return <SiteConfigContext.Provider value={value}>{children}</SiteConfigContext.Provider>;
}

export function useSiteConfig(): SiteConfigContextValue {
  const ctx = useContext(SiteConfigContext);
  if (!ctx) {
    throw new Error("useSiteConfig must be used within a SiteConfigProvider");
  }
  return ctx;
}
