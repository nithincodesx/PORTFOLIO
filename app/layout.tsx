import type { Metadata } from "next";
import type { ReactNode } from "react";
import { MusicPlayer } from "@/components/music-player";
import { ScrollProgress } from "@/components/scroll-progress";
import "./globals.css";

export const metadata: Metadata = {
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
  openGraph: {
    title: "Nithin | AI Engineer",
    description: "Building voice AI, autonomous agents, and reliable RAG systems.",
    type: "website"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="noise font-sans antialiased">
        <ScrollProgress />
        {children}
        <MusicPlayer />
      </body>
    </html>
  );
}
