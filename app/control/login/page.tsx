"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Lock, ShieldAlert } from "lucide-react";

import { inputCls } from "@/components/control/field-editor";
import { useAuth } from "@/components/control/auth-provider";
import { isFirebaseEnvConfigured } from "@/lib/cms/load";

export default function ControlLoginPage() {
  const router = useRouter();
  const { configured, user, loading, isAdmin, signIn, signOut } = useAuth();
  const envReady = isFirebaseEnvConfigured();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* Already signed in as an admin → go straight to the dashboard.
     Signed in but NOT on the allowlist → kick the account out. */
  useEffect(() => {
    if (loading) return;
    if (user && isAdmin) {
      router.replace("/control");
      return;
    }
    if (user && !isAdmin) {
      void signOut();
      setError("This Firebase account is not authorized to access the control panel.");
    }
  }, [loading, user, isAdmin, router, signOut]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      /* The effect above redirects on success (isAdmin) or signs out (not admin). */
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a moment and try again.");
      } else if (code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError(err instanceof Error ? err.message : "Sign-in failed.");
      }
      setSubmitting(false);
    }
  };

  if (!envReady || !configured) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#0C0C0C] px-6">
        <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#111113] p-8">
          <div className="mb-5 flex items-center gap-3">
            <ShieldAlert size={20} className="text-[#F5A623]" />
            <h1 className="text-xl font-semibold text-white">Firebase setup required</h1>
          </div>
          <p className="text-sm leading-relaxed text-white/55">
            The control panel is installed but Firebase is not configured yet. Complete these
            steps once:
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-white/70">
            <li>
              Create a Firebase project, enable <strong>Authentication → Email/Password</strong>,
              and add a Web App.
            </li>
            <li>
              Copy the web config into <code className="text-[#F5A623]">.env.local</code> as{" "}
              <code className="text-[#F5A623]">NEXT_PUBLIC_FIREBASE_*</code> (see{" "}
              <code className="text-[#F5A623]">.env.example</code>).
            </li>
            <li>
              Set <code className="text-[#F5A623]">NEXT_PUBLIC_ADMIN_EMAILS</code> to your login
              email.
            </li>
            <li>
              Create your user in Firebase Authentication and deploy{" "}
              <code className="text-[#F5A623]">firestore.rules</code>.
            </li>
          </ol>
          <p className="mt-5 text-xs text-white/35">
            Full instructions are in the README section “Admin Control Panel”.
          </p>
          <a
            href="/"
            className="mt-6 inline-block text-xs text-white/40 transition hover:text-[#F5A623]"
          >
            ← Back to the site
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0C0C0C] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-3xl font-semibold text-white">
            NK<span className="text-[#F5A623]">.</span>
          </p>
          <p className="mt-1 font-mono text-[0.62rem] uppercase tracking-[0.28em] text-white/40">
            Control Panel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-[#111113] p-6">
          <div className="mb-5 flex items-center gap-2 text-white/70">
            <Lock size={14} />
            <h1 className="text-sm font-medium">Authorized access only</h1>
          </div>

          <label className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/45">
            Email
          </label>
          <input
            type="email"
            required
            autoComplete="email"
            className={`${inputCls} mb-4`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <label className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-[0.16em] text-white/45">
            Password
          </label>
          <input
            type="password"
            required
            autoComplete="current-password"
            className={`${inputCls} mb-5`}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[#F5A623] py-2.5 text-sm font-semibold text-[#0C0C0C] transition hover:brightness-110 disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-white/30">
          Protected by Firebase Authentication. Unauthorized accounts are blocked.
        </p>
        <p className="mt-2 text-center">
          <a href="/" className="text-xs text-white/35 transition hover:text-[#F5A623]">
            ← Back to the site
          </a>
        </p>
      </div>
    </main>
  );
}

