import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MusicPlayer } from "@/components/music-player";
import { ScrollProgress } from "@/components/scroll-progress";
import { SiteConfigProvider } from "@/components/cms/site-config-provider";
import { DEFAULT_SITE_CONFIG } from "@/lib/cms/defaults";
import { getSiteConfigServer, mergeSiteConfig } from "@/lib/cms/load";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  title: "Nithin | AI Engineer",
  description:
    "AI Engineer portfolio for Nithin — building voice AI, autonomous agents, reliable RAG systems, and modern full-stack experiences.",
  keywords: [
    "AI Engineer",
    "Machine Learning",
    "LLM",
    "LangChain",
    "Next.js",
    "Nithin"
  ],
  authors: [{ name: "Nithin" }],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Nithin | AI Engineer",
    description: "Building voice AI, autonomous agents, and reliable RAG systems.",
    type: "website",
    url: "/",
    siteName: "Nithin | AI Engineer",
    images: [
      {
        url: "/opengraph-image.svg",
        width: 1200,
        height: 630,
        alt: "Nithin — AI Engineer",
      },
    ],
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  /* Server-side CMS read (ISR, cached 60s): the rendered HTML already
     contains the Firestore content, so the public site is genuinely driven
     by the control panel even if the browser-side fetch fails. Falls back to
     the shipped defaults whenever Firebase/Firestore is unavailable. */
  const stored = await getSiteConfigServer();
  const initialConfig = mergeSiteConfig(DEFAULT_SITE_CONFIG, stored);

  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400;500&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
        />
      </head>
      <body className="noise font-sans antialiased">
        <SiteConfigProvider
          initialConfig={initialConfig}
          initialSource={stored ? "firestore" : "defaults"}
        >
          <ScrollProgress />
          {children}
          <MusicPlayer />
        </SiteConfigProvider>
      </body>
    </html>
  );
}
