"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut } from "lucide-react";

import { useAuth } from "@/components/control/auth-provider";
import { EDITOR_GROUPS, EDITOR_SECTIONS } from "@/lib/cms/registry";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.replace("/control/login");
  };

  const linkCls = (slug: string) => {
    const active = slug
      ? pathname === `/control/${slug}`
      : pathname === "/control" || pathname === "/control/";
    return `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
      active
        ? "bg-[#F5A623]/10 text-[#F5A623]"
        : "text-white/55 hover:bg-white/5 hover:text-white"
    }`;
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-[#0A0A0B] lg:flex">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/control" className="text-lg font-semibold text-white">
          NK<span className="text-[#F5A623]">.</span>
        </Link>
        <p className="mt-0.5 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/35">
          Control Panel
        </p>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <Link href="/control" className={`${linkCls("")} mb-4`}>
          <LayoutDashboard size={15} /> Overview
        </Link>

        {EDITOR_GROUPS.map((group) => {
          const sections = EDITOR_SECTIONS.filter((s) => s.group === group.id);
          if (sections.length === 0) return null;
          return (
            <div key={group.id} className="mb-5">
              <p className="mb-1.5 px-3 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/30">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {sections.map((section) => (
                  <Link key={section.slug} href={`/control/${section.slug}`} className={linkCls(section.slug)}>
                    <section.icon size={15} />
                    <span className="truncate">{section.title}</span>
                    {section.badge && (
                      <span
                        className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-white/25"
                        title={section.badge}
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="truncate text-xs text-white/40" title={user?.email ?? undefined}>
          {user?.email}
        </p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/50 transition hover:text-red-400"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </aside>
  );
}
