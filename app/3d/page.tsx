import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";

import { EditorialPortfolio } from "@/components/3d/portfolio-3d";
import { SmoothScroll } from "@/components/3d/smooth-scroll";
import type { GalleryImage } from "@/components/3d/project-gallery";

const GALLERY_DIR = path.join(process.cwd(), "public", "project-gallery");
const IMAGE_EXT = /\.(png|jpe?g|webp|gif|avif|svg)$/i;

/**
 * Auto-loads every image dropped into /public/project-gallery.
 * Add or remove files there — no code changes needed.
 * (On a production build the list is baked in at build time.)
 */
function readGalleryImages(): GalleryImage[] {
  try {
    return fs
      .readdirSync(GALLERY_DIR)
      .filter((file) => IMAGE_EXT.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => ({
        src: `/project-gallery/${encodeURI(file)}`,
        alt:
          file
            .replace(IMAGE_EXT, "")
            .replace(/[-_]+/g, " ")
            .replace(/\s+/g, " ")
            .trim() || "Project preview",
      }));
  } catch {
    /* folder missing / unreadable → gallery stays hidden */
    return [];
  }
}

export const metadata: Metadata = {
  title: "Nithin Krishna | AI Engineer",
  description:
    "AI Engineer building voice AI, autonomous agents, and reliable RAG systems. Premium editorial portfolio.",
};

export default function PortfolioPage() {
  return (
    <SmoothScroll>
      <EditorialPortfolio galleryImages={readGalleryImages()} />
    </SmoothScroll>
  );
}
