/**
 * Site configuration schema for the admin control panel (/control).
 *
 * The public site reads this document from Firestore (`siteConfig/main`) and
 * falls back to DEFAULT_SITE_CONFIG (lib/cms/defaults.ts) whenever Firebase is
 * not configured, the document is missing, or the fetch fails — so the site
 * never breaks and never looks different from the shipped defaults.
 */

/** Sections that are rendered (and can be reordered/hidden) on the public page. */
export type RenderableSectionId =
  | "hero"
  | "marquee"
  | "about"
  | "work"
  | "gallery"
  | "services"
  | "experience"
  | "skills"
  | "contact";

/** One entry in the section visibility / ordering editor. */
export type SectionEntry = {
  id: RenderableSectionId;
  label: string;
  visible: boolean;
  /** Lower numbers render first. */
  order: number;
  /** Renders the hairline divider after this section (matches original design). */
  dividerAfter: boolean;
};

export type HeroConfig = {
  headline: { line1: string; line2: string; line3: string; accent: string };
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
};

export type ProjectItem = {
  num: string;
  title: string;
  tags: string[];
  year: string;
  url: string;
  desc: string;
};

export type ServiceItem = { icon: string; title: string; desc: string };

export type ExperienceItem = {
  period: string;
  role: string;
  company: string;
  location: string;
  stack: string[];
  summary?: string;
};

export type SocialItem = { label: string; href: string };

export type SkillItem = { name: string; level: string };

export type SiteConfig = {
  hero: HeroConfig;
  about: { headline: string; body: string };
  projects: {
    label: string;
    number: string;
    allProjectsLabel: string;
    allProjectsHref: string;
    items: ProjectItem[];
  };
  gallery: { enabled: boolean; label: string; title: string; hint: string };
  services: { label: string; number: string; items: ServiceItem[] };
  experience: { label: string; number: string; items: ExperienceItem[] };
  skills: { items: SkillItem[] };
  socials: { items: SocialItem[] };
  contact: {
    label: string;
    headline: string[];
    email: string;
    messageLabel: string;
    cvLabel: string;
    resumeUrl: string;
  };
  content: {
    marquee: string[];
    footer: { logo: string; copyright: string; credit: string };
  };
  theme: { accent: string; accentDim: string; bg: string; surface: string };
  music: {
    enabled: boolean;
    src: string;
    label: string;
    defaultVolume: number;
    loop: boolean;
    autoplay: boolean;
  };
  preloader: {
    words: string[];
    duration: number;
    enabled: boolean;
  };
  heroGlow: {
    enabled: boolean;
    leftColor: string;
    rightColor: string;
    width: string;
  };
  sections: SectionEntry[];
};

export type SiteConfigKey = keyof SiteConfig;
