import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  FileText,
  FolderGit2,
  History,
  Images,
  LayoutList,
  Mail,
  Music,
  Palette,
  Share2,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";

import type { SiteConfigKey } from "@/lib/cms/types";

/** A single editable field inside a section editor. */
export type FieldDef =
  | {
      key: string;
      label: string;
      type: "text" | "url" | "email" | "color" | "number" | "toggle";
      help?: string;
      placeholder?: string;
    }
  | {
      key: string;
      label: string;
      type: "textarea";
      help?: string;
      placeholder?: string;
      rows?: number;
    }
  | { key: string; label: string; type: "string-list"; help?: string; placeholder?: string }
  | { key: string; label: string; type: "object"; help?: string; fields: FieldDef[] }
  | {
      key: string;
      label: string;
      type: "object-list";
      help?: string;
      itemTitleKey?: string;
      addLabel?: string;
      fields: FieldDef[];
    };

export type EditorGroup = "content" | "settings" | "structure";

/**
 * Registry of every admin editor. Adding a new editor =
 * add one entry here (slug becomes the /control/<slug> route).
 */
export type EditorSectionDef = {
  /** Top-level key in SiteConfig — where this editor saves its data. */
  id: SiteConfigKey;
  /** URL slug: /control/<slug>. */
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  group: EditorGroup;
  /** Optional badge, e.g. for sections not rendered on the site yet. */
  badge?: string;
  fields?: FieldDef[];
  /** Custom (non schema-driven) editors. */
  custom?: "sections";
};

export const EDITOR_GROUPS: { id: EditorGroup; label: string }[] = [
  { id: "content", label: "Content" },
  { id: "settings", label: "Settings" },
  { id: "structure", label: "Structure" },
];

export const EDITOR_SECTIONS: EditorSectionDef[] = [
  {
    id: "hero",
    slug: "hero",
    title: "Hero",
    description: "Headline lines, intro paragraph, and call-to-action buttons.",
    icon: Sparkles,
    group: "content",
    fields: [
      {
        key: "headline",
        label: "Headline",
        type: "object",
        fields: [
          { key: "line1", label: "Line 1 (light weight)", type: "text" },
          { key: "line2", label: "Line 2 (bold)", type: "text" },
          { key: "line3", label: "Line 3 (bold)", type: "text" },
          { key: "accent", label: "Accent character", type: "text", placeholder: "." },
        ],
      },
      { key: "description", label: "Description", type: "textarea", rows: 3 },
      {
        key: "primaryCta",
        label: "Primary button",
        type: "object",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Link", type: "text", placeholder: "#work" },
        ],
      },
      {
        key: "secondaryCta",
        label: "Secondary button",
        type: "object",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "Link", type: "text", placeholder: "#contact" },
        ],
      },
    ],
  },
  {
    id: "projects",
    slug: "projects",
    title: "Projects",
    description: "The numbered Work list: titles, tags, years, links, and blurbs.",
    icon: FolderGit2,
    group: "content",
    fields: [
      { key: "label", label: "Section label", type: "text", placeholder: "— Selected Work" },
      { key: "number", label: "Section number", type: "text", placeholder: "01" },
      { key: "allProjectsLabel", label: "“All projects” link label", type: "text" },
      { key: "allProjectsHref", label: "“All projects” link URL", type: "url" },
      {
        key: "items",
        label: "Projects",
        type: "object-list",
        itemTitleKey: "title",
        addLabel: "Add project",
        fields: [
          { key: "num", label: "Number", type: "text", placeholder: "01" },
          { key: "title", label: "Title", type: "text" },
          { key: "year", label: "Year", type: "text", placeholder: "2026" },
          { key: "url", label: "URL", type: "url" },
          { key: "tags", label: "Tags", type: "string-list", placeholder: "RAG" },
          { key: "desc", label: "Description", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
  {
    id: "gallery",
    slug: "gallery",
    title: "Project Gallery",
    description:
      "The sticky image stack. Images are loaded from /public/project-gallery — drop files there to add or remove them.",
    icon: Images,
    group: "content",
    fields: [
      { key: "enabled", label: "Show gallery section", type: "toggle" },
      { key: "label", label: "Section label", type: "text", placeholder: "— Project Gallery" },
      { key: "title", label: "Title", type: "text" },
      { key: "hint", label: "Scroll hint", type: "text", placeholder: "Scroll to stack ↓" },
    ],
  },
  {
    id: "services",
    slug: "services",
    title: "Services",
    description: "The “What I Build” cards: icon, title, and description.",
    icon: Wrench,
    group: "content",
    fields: [
      { key: "label", label: "Section label", type: "text", placeholder: "— What I Build" },
      { key: "number", label: "Section number", type: "text", placeholder: "02" },
      {
        key: "items",
        label: "Services",
        type: "object-list",
        itemTitleKey: "title",
        addLabel: "Add service",
        fields: [
          {
            key: "icon",
            label: "Icon (Material Symbol name)",
            type: "text",
            placeholder: "rocket_launch",
          },
          { key: "title", label: "Title", type: "text" },
          { key: "desc", label: "Description", type: "textarea", rows: 3 },
        ],
      },
    ],
  },
  {
    id: "experience",
    slug: "experience",
    title: "Experience",
    description: "The experience table: period, role, company, stack chips, summary.",
    icon: History,
    group: "content",
    fields: [
      { key: "label", label: "Section label", type: "text", placeholder: "— Journey" },
      { key: "number", label: "Section number", type: "text", placeholder: "03" },
      {
        key: "items",
        label: "Rows",
        type: "object-list",
        itemTitleKey: "role",
        addLabel: "Add row",
        fields: [
          { key: "period", label: "Period", type: "text", placeholder: "2024 — Present" },
          { key: "role", label: "Role", type: "text" },
          { key: "company", label: "Company", type: "text" },
          { key: "location", label: "Location", type: "text" },
          { key: "stack", label: "Stack chips", type: "string-list", placeholder: "Next.js" },
          { key: "summary", label: "Summary (optional)", type: "textarea", rows: 2 },
        ],
      },
    ],
  },
  {
    id: "socials",
    slug: "socials",
    title: "Social Links",
    description: "The social row shown in the contact section.",
    icon: Share2,
    group: "content",
    fields: [
      {
        key: "items",
        label: "Links",
        type: "object-list",
        itemTitleKey: "label",
        addLabel: "Add link",
        fields: [
          { key: "label", label: "Label", type: "text", placeholder: "GitHub" },
          { key: "href", label: "URL", type: "url" },
        ],
      },
    ],
  },
  {
    id: "contact",
    slug: "contact",
    title: "Contact Info",
    description: "Contact headline, email address, CTA labels, and résumé link.",
    icon: Mail,
    group: "content",
    fields: [
      { key: "label", label: "Section label", type: "text", placeholder: "— Let's Talk" },
      { key: "headline", label: "Headline lines (last line is italic)", type: "string-list" },
      { key: "email", label: "Email", type: "email" },
      { key: "messageLabel", label: "Message button label", type: "text" },
      { key: "cvLabel", label: "Résumé button label", type: "text" },
      { key: "resumeUrl", label: "Résumé URL", type: "text", placeholder: "/resume.pdf" },
    ],
  },
  {
    id: "content",
    slug: "content",
    title: "Site Content",
    description: "Marquee strip text and footer copy.",
    icon: FileText,
    group: "content",
    fields: [
      { key: "marquee", label: "Marquee items", type: "string-list", placeholder: "Voice AI" },
      {
        key: "footer",
        label: "Footer",
        type: "object",
        fields: [
          { key: "logo", label: "Logo", type: "text" },
          { key: "copyright", label: "Copyright line", type: "text" },
          { key: "credit", label: "Credit line", type: "text" },
        ],
      },
    ],
  },
  {
    id: "about",
    slug: "about",
    title: "About",
    description: "The short positioning statement shown in the About section.",
    icon: User,
    group: "content",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "body", label: "Body", type: "textarea", rows: 6 },
    ],
  },
  {
    id: "skills",
    slug: "skills",
    title: "Skills",
    description: "The tools and capabilities shown in the Skills section.",
    icon: Briefcase,
    group: "content",
    fields: [
      {
        key: "items",
        label: "Skills",
        type: "object-list",
        itemTitleKey: "name",
        addLabel: "Add skill",
        fields: [
          { key: "name", label: "Name", type: "text", placeholder: "RAG" },
          { key: "level", label: "Level / note", type: "text", placeholder: "Expert" },
        ],
      },
    ],
  },
  {
    id: "theme",
    slug: "theme",
    title: "Theme & Accent",
    description: "Accent color and core palette used across the public site.",
    icon: Palette,
    group: "settings",
    fields: [
      { key: "accent", label: "Accent color", type: "color" },
      { key: "accentDim", label: "Dimmed accent color", type: "color" },
      { key: "bg", label: "Background", type: "color" },
      { key: "surface", label: "Surface", type: "color" },
    ],
  },
  {
    id: "music",
    slug: "music",
    title: "Music",
    description: "Background music player: track, volume, loop, and autoplay.",
    icon: Music,
    group: "settings",
    fields: [
      { key: "enabled", label: "Show music player", type: "toggle" },
      { key: "src", label: "Track URL", type: "text", placeholder: "/music/portfolio.mp3" },
      { key: "label", label: "Track label", type: "text" },
      { key: "defaultVolume", label: "Default volume (0–1)", type: "number" },
      { key: "loop", label: "Loop", type: "toggle" },
      { key: "autoplay", label: "Autoplay", type: "toggle" },
    ],
  },
  {
    id: "sections",
    slug: "sections",
    title: "Sections",
    description: "Control which sections appear on the homepage and in what order.",
    icon: LayoutList,
    group: "structure",
    custom: "sections",
  },
];

export function getEditorSection(slug: string): EditorSectionDef | undefined {
  return EDITOR_SECTIONS.find((section) => section.slug === slug);
}


