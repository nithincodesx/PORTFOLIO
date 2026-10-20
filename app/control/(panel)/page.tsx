"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ExternalLink,
  FolderGit2,
  LayoutList,
  Server,
  Share2,
} from "lucide-react";

import { useAuth } from "@/components/control/auth-provider";
import { useSiteConfig } from "@/components/cms/site-config-provider";
import {
  checkFirestoreBackend,
  type FirestoreBackendStatus,
} from "@/lib/cms/load";
import { EDITOR_GROUPS, EDITOR_SECTIONS } from "@/lib/cms/registry";

const BACKEND_LABELS: Record<
  FirestoreBackendStatus,
  { label: string; tone: string; showEnableLink?: boolean }
> = {
  ok: { label: "Firestore ready — saves and live updates are working", tone: "text-emerald-400" },
  "no-document": {
    label: "Firestore ready — no CMS document yet; open any editor and hit Save once to create it",
    tone: "text-amber-300",
  },
  "api-disabled": {
    label: "BLOCKED: the Cloud Firestore API is disabled for this project — saves cannot work yet",
    tone: "text-red-400",
    showEnableLink: true,
  },
  denied: {
    label: "Access denied — publish firestore.rules in the Firebase console (Firestore → Rules)",
    tone: "text-red-400",
  },
  unreachable: { label: "Cannot reach Firestore — check your internet connection", tone: "text-red-400" },
};

export default function ControlDashboardPage() {
  const { user } = useAuth();
  const { config, loaded, source } = useSiteConfig();
  const [backend, setBackend] = useState<FirestoreBackendStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    checkFirestoreBackend().then((status) => {
      if (!cancelled) setBackend(status);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
  const backendInfo = backend ? BACKEND_LABELS[backend] : null;

  const visibleSections = config.sections.filter((s) => s.visible).length;
  const stats = [
    { label: "Projects", value: config.projects.items.length, icon: FolderGit2 },
    { label: "Social links", value: config.socials.items.length, icon: Share2 },
    { label: "Visible sections", value: `${visibleSections}/${config.sections.length}`, icon: LayoutList },
  ];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
      <header className="border-b border-white/10 pb-6">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.28em] text-[#F5A623]">
          Private admin area
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Control Panel</h1>
        <p className="mt-2 max-w-xl text-sm text-white/45">
          Manage the content of your portfolio. Changes are saved to Firestore and appear on the
          live site after the next page load.
        </p>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            <stat.icon size={16} className="text-[#F5A623]" />
            <p className="mt-3 text-2xl font-semibold text-white">{stat.value}</p>
            <p className="text-xs text-white/40">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs text-white/45">
        <span className="inline-flex items-center gap-1.5">
          <Activity
            size={13}
            className={
              !loaded ? "text-white/40" : source === "firestore" ? "text-emerald-400" : "text-amber-400"
            }
          />
          {!loaded
            ? "Loading configuration…"
            : source === "firestore"
              ? "Live from Firestore"
              : "Running on built-in defaults"}
        </span>
        <span>Signed in as <span className="text-white/70">{user?.email}</span></span>
        <a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition hover:text-[#F5A623]">
          View site <ExternalLink size={12} />
        </a>
        {loaded && source === "defaults" && (
          <span className="w-full text-amber-300/90">
            No Firestore data yet — saving will fail until the Firestore API is enabled and the
            database created (Firebase console → Firestore → Create database), then publish
            <code className="mx-1 text-white/60">firestore.rules</code>. See README → Admin
            Control Panel.
          </span>
        )}
      </div>

      {/* ── Backend diagnostic ─────────────────────────────────────── */}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs">
        <span className="inline-flex items-center gap-1.5 font-mono uppercase tracking-[0.16em] text-white/40">
          <Server size={13} /> Backend
        </span>
        {!backend && <span className="text-white/40">Checking Firestore…</span>}
        {backendInfo && (
          <span className={`inline-flex flex-wrap items-center gap-2 ${backendInfo.tone}`}>
            {backendInfo.label}
            {backendInfo.showEnableLink && projectId && (
              <a
                href={`https://console.developers.google.com/apis/api/firestore.googleapis.com/overview?project=${projectId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-md border border-red-400/40 px-2 py-0.5 text-[0.7rem] text-red-300 transition hover:bg-red-400/10"
              >
                Enable Firestore API <ExternalLink size={11} />
              </a>
            )}
          </span>
        )}
        <button
          type="button"
          className="ml-auto text-[0.7rem] text-white/35 underline-offset-2 transition hover:text-white/70 hover:underline"
          onClick={() => {
            setBackend(null);
            checkFirestoreBackend().then(setBackend);
          }}
        >
          Re-check
        </button>
      </div>

      {EDITOR_GROUPS.map((group) => {
        const sections = EDITOR_SECTIONS.filter((s) => s.group === group.id);
        if (sections.length === 0) return null;
        return (
          <section key={group.id} className="mt-8">
            <h2 className="mb-3 font-mono text-[0.62rem] uppercase tracking-[0.24em] text-white/35">
              {group.label}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {sections.map((section) => (
                <Link
                  key={section.slug}
                  href={`/control/${section.slug}`}
                  className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-[#F5A623]/50"
                >
                  <div className="flex items-center gap-2.5">
                    <section.icon size={16} className="text-[#F5A623]" />
                    <span className="text-sm font-medium text-white">{section.title}</span>
                    {section.badge && (
                      <span className="ml-auto rounded-full border border-white/15 px-2 py-0.5 font-mono text-[0.55rem] uppercase tracking-widest text-white/45">
                        {section.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-white/40">
                    {section.description}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      <p className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-xs leading-relaxed text-white/35">
        Security: this route is unlisted and <code className="text-white/55">noindex</code>, but
        protection does not rely on hiding the URL — access requires a Firebase account on the
        admin allowlist, and Firestore writes are restricted by security rules to that same
        account.
      </p>
    </div>
  );
}
