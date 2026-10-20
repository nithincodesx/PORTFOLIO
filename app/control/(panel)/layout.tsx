"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck } from "lucide-react";

import { useAuth } from "@/components/control/auth-provider";
import { Sidebar } from "@/components/control/sidebar";

/**
 * Auth guard for every /control route except /control/login.
 * - Still resolving the auth session → loading screen
 * - Not signed in → redirect to /control/login
 * - Signed in but not on the admin allowlist → sign out + redirect away
 *
 * This blocks unauthorized users from seeing the panel UI; the data itself is
 * protected server-side by firestore.rules (writes require the admin email).
 */
export default function ControlPanelLayout({ children }: { children: ReactNode }) {
  const { configured, user, loading, isAdmin, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = configured && !loading && user !== null && isAdmin;

  useEffect(() => {
    if (loading) return;
    if (!configured || !user) {
      router.replace("/control/login");
      return;
    }
    if (!isAdmin) {
      void signOut();
      router.replace("/");
    }
  }, [configured, loading, user, isAdmin, router, pathname, signOut]);

  if (!allowed) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-[#0C0C0C] text-white">
        <ShieldCheck size={26} className="animate-pulse text-[#F5A623]" />
        <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-white/45">
          Verifying access…
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0C0C0C] text-white">
      <div className="lg:flex">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <MobileBar />
          {children}
        </main>
      </div>
    </div>
  );
}

function MobileBar() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  return (
    <div className="flex items-center justify-between border-b border-white/10 bg-[#0A0A0B] px-4 py-3 lg:hidden">
      <a href="/control" className="font-semibold text-white">
        NK<span className="text-[#F5A623]">.</span>
        <span className="ml-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/40">
          Control
        </span>
      </a>
      <button
        type="button"
        className="text-xs text-white/50 transition hover:text-red-400"
        onClick={async () => {
          await signOut();
          router.replace("/control/login");
        }}
      >
        {user?.email} · Sign out
      </button>
    </div>
  );
}
