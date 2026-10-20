/** @file staqk types - shared types for streak tracking with UK timezone support */

import type { SiteConfig, SiteConfigKey } from "@/lib/cms/types";

/** A single day with activity flag and optional streak override */
export type StreakDay = {
  date: string; // ISO date string (YYYY-MM-DD) in UTC
  active: boolean; // true if there was activity that day
};

/** Streak configuration for the CMS */
export type StreakConfig = {
  /**
   * Timezone offset for streak calculations (UK: prefer automatic via Intl)
   * Stored as a string to allow future manual overrides (e.g., "Europe/London")
   */
  timezone: string;

  /**
   * The label prefix shown before streak numbers (e.g., "🔥 5-day streak")
   * Can contain markdown.
   */
  labelPrefix: string;

  /**
   * Whether to show a "streak delta" (up/down arrows vs. yesterday)
   */
  showDelta: boolean;

  /**
   * Whether to show streak badges in the hero
   */
  showHeroBadges: boolean;

  /**
   * Whether to show streak stats in the About section
   */
  showAboutStats: boolean;

  /**
   * Whether to show streak calendar in the Project Gallery section
   */
  showCalendar: boolean;

  /**
   * Minimum streak length to display (e.g., 1 means show all, 7 means hide <7)
   */
  minStreakLength: number;

  /**
   * Whether to normalize UK DST transitions
   */
  normalizeUKDst: boolean;
};

/** Extended site config with streak fields */
/** Extended site config with streak fields */
export type SiteConfigWithStreaks = SiteConfig & {
  streaks: StreakConfig & Record<string, unknown>;
};

/** Streak data structure for API responses */
export type StreakData = {
  /** The username whose streaks are being calculated */
  username: string;

  /** When the data was generated (ISO 8601, UTC) */
  generatedAt: string;

  /** Latest activity date (YYYY-MM-DD) */
  latestActivity: string | null;

  /** Total consecutive active days */
  streakCount: number;

  /** Longest streak in the window */
  longestStreak: number;

  /** Current streak type (day | week | month) */
  streakType: "day" | "week" | "month";

  /** Whether the user is active today */
  isActiveToday: boolean;

  /** Total active days in the window */
  activeDays: number;

  /** Total days in the window */
  totalDays: number;

  /** Daily activity data */
  days: StreakDay[];

  /** UK-specific: whether today is a UK public holiday (placeholder for future) */
  isUkPublicHoliday: boolean;

  /** UK timezone offset in minutes (e.g., +60 for BST) */
  ukTimezoneOffsetMinutes: number;
};

/** Legacy type alias for backward compatibility */
export type Streak = StreakData;

