import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AuthProvider } from "@/components/control/auth-provider";

export const metadata: Metadata = {
  title: "Control Panel",
  robots: { index: false, follow: false },
};

/**
 * Root layout for the private admin area at /control.
 * Never linked from the public navbar, footer, or any other page — it is
 * reached only by typing the URL, and access is enforced by Firebase
 * Authentication (see components/control/auth-provider.tsx) plus Firestore
 * security rules for the data itself.
 */
export default function ControlRootLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
