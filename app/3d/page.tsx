import type { Metadata } from "next";
import { EditorialPortfolio } from "@/components/3d/portfolio-3d";

export const metadata: Metadata = {
  title: "Nithin Krishna | AI Engineer",
  description:
    "AI Engineer building voice AI, autonomous agents, and reliable RAG systems. Premium editorial portfolio.",
};

export default function PortfolioPage() {
  return <EditorialPortfolio />;
}
