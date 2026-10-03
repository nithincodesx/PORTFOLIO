import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
};

export type SocialLink = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export type Stat = {
  label: string;
  value: string;
};

/** A selected project shown in the numbered "Work" list. */
export type Project = {
  number: string; // "01"
  title: string;
  description: string;
  tags: string[];
  year: string;
  url: string;
  points: string[]; // shown when the row expands
};

/** An accordion row in the Service section. */
export type Service = {
  number: string; // "01"
  title: string;
  tagline: string; // short line shown under the title while collapsed
  description: string; // revealed when expanded
  points: string[];
  icon: LucideIcon;
};

/** A row in the Experience table. */
export type ExperienceRow = {
  period: string;
  role: string;
  company: string;
  location: string;
  stack: string[];
  points: string[];
};

export type Certification = {
  title: string;
  issuer: string;
  year: string;
};
