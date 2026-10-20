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
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";

import { getFirebaseApp, isFirebaseConfigured } from "@/lib/firebase/client";

/**
 * Emails allowed to use the control panel (comma-separated).
 * Fail-closed: when the env var is missing, NOBODY is treated as admin.
 * This list is UX gating only — the real enforcement lives in firestore.rules,
 * which restricts writes to the same admin email(s).
 */
const ADMIN_EMAILS = (process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

type AuthContextValue = {
  configured: boolean;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = isFirebaseConfigured();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }
    const app = getFirebaseApp();
    if (!app) {
      setLoading(false);
      return;
    }
    const auth = getAuth(app);
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, [configured]);

  const signIn = useCallback(async (email: string, password: string) => {
    const app = getFirebaseApp();
    if (!app) throw new Error("Firebase is not configured.");
    await signInWithEmailAndPassword(getAuth(app), email, password);
  }, []);

  const signOut = useCallback(async () => {
    const app = getFirebaseApp();
    if (!app) return;
    await firebaseSignOut(getAuth(app));
  }, []);

  const isAdmin = useMemo(() => {
    const email = user?.email?.toLowerCase();
    return Boolean(email && ADMIN_EMAILS.includes(email));
  }, [user]);

  const value = useMemo(
    () => ({ configured, user, loading, isAdmin, signIn, signOut }),
    [configured, user, loading, isAdmin, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
