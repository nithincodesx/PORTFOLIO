"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";

/**
 * Compact GitHub-style contribution calendar shown in the hero.
 * Uses REAL contribution data from the server route (/api/contributions),
 * refreshes at most once every 24h, and falls back to the last cached data
 * (or an empty frame) if GitHub is unreachable.
 */

type Day = { date: string; count: number };
type Cell = Day | null;
type HoveredCell = { week: number; x: number; y: number; count: number; date: string };
type CachedPayload = { at: number; days: Day[] };

const CACHE_KEY = "nk-gh-contributions-v1";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
/** Number of week columns shown (~6 months). */
const WEEKS = 27;

/* ── Date helpers — always UTC so dates never shift ─────────────────────── */
function utcDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function weekdayOf(value: string): number {
  return utcDate(value).getUTCDay();
}

function todayUtcStr(): string {
  const n = new Date();
  const mm = String(n.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(n.getUTCDate()).padStart(2, "0");
  return `${n.getUTCFullYear()}-${mm}-${dd}`;
}

function monthLabel(value: string): string {
  return utcDate(value).toLocaleDateString("en-US", { month: "short", timeZone: "UTC" });
}

function fullDateLabel(value: string): string {
  return utcDate(value).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC"
  });
}

/** Placeholder frame (~6 months, Sundays → today) used before data loads. */
function emptyFrameDays(): Day[] {
  const today = utcDate(todayUtcStr());
  const start = new Date(today);
  start.setUTCDate(today.getUTCDate() - (today.getUTCDay() + (WEEKS - 1) * 7));
  const days: Day[] = [];
  for (const d = new Date(start); d <= today; d.setUTCDate(d.getUTCDate() + 1)) {
    days.push({ date: d.toISOString().slice(0, 10), count: 0 });
  }
  return days;
}

/** Group contiguous days into Sunday→Saturday week columns (7 rows). */
function groupIntoWeeks(days: Day[]): Cell[][] {
  if (!days.length) return [];
  const weeks: Cell[][] = [];
  let current: Cell[] = [];

  const leading = weekdayOf(days[0].date);
  for (let i = 0; i < leading; i += 1) current.push(null);

  for (const day of days) {
    if (weekdayOf(day.date) === 0 && current.length) {
      weeks.push(current);
      current = [];
    }
    current.push(day);
  }

  while (current.length < 7) current.push(null);
  weeks.push(current);
  return weeks;
}

/** GitHub-like intensity: 0 = none, 1–4 quartiles of the busiest day. */
function makeLevelFn(counts: number[]): (count: number) => number {
  const max = counts.reduce((m, c) => (c > m ? c : m), 0);
  if (max <= 0) return () => 0;
  const step = max / 4;
  return (count) => (count <= 0 ? 0 : Math.min(4, Math.max(1, Math.ceil(count / step))));
}

/* ── Scoped styles (mirrors GitHub's calendar, themed to the portfolio) ──── */
const CALENDAR_STYLES = `
  .gh-cal {
    --gh-gap: 2.5px;
    /* Cell size is derived from the available width so the whole calendar
       always fits the exact space shared with the hero buttons. */
    --gh-cell: max(4px, calc((100cqw - (var(--gh-weeks) - 1) * var(--gh-gap)) / var(--gh-weeks)));
    container-type: inline-size;
    width: 100%;
    min-height: 88px;
    /* Nudge the graph up toward the hero buttons. Transform (not margin) so
       the box, its reserved height, and every other element stay untouched. */
    transform: translateY(-12px);
    font-family: 'JetBrains Mono', monospace;
  }
  .gh-cal-months {
    position: relative;
    height: 11px;
    margin-bottom: 5px;
  }
  .gh-cal-month {
    position: absolute;
    top: 0;
    font-size: 0.6rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
  }
  .gh-cal-grid {
    position: relative;
    display: grid;
    grid-auto-flow: column;
    grid-template-rows: repeat(7, var(--gh-cell));
    grid-auto-columns: var(--gh-cell);
    gap: var(--gh-gap);
  }
  .gh-cell {
    width: var(--gh-cell);
    height: var(--gh-cell);
    border-radius: 2px;
    background: rgba(255, 255, 255, 0.055);
    outline: 1px solid transparent;
    transition: outline-color 0.15s ease;
  }
  .gh-cell[data-level="1"] { background: rgba(91, 255, 143, 0.22); }
  .gh-cell[data-level="2"] { background: rgba(91, 255, 143, 0.45); }
  .gh-cell[data-level="3"] { background: rgba(91, 255, 143, 0.72); }
  .gh-cell[data-level="4"] { background: #5BFF8F; }
  .gh-cell--live:hover { outline-color: rgba(255, 255, 255, 0.55); }

  .gh-tip {
    position: absolute;
    z-index: 30;
    pointer-events: none;
    padding: 0.4rem 0.55rem;
    border-radius: 6px;
    background: #1b201d;
    border: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.55);
    font-size: 0.6rem;
    line-height: 1.4;
    color: var(--white);
    white-space: nowrap;
  }
  .gh-tip strong { font-weight: 500; color: var(--white); }
  .gh-tip em { font-style: normal; color: var(--muted); }
  .gh-tip--center { transform: translate(-50%, calc(-100% - 7px)); }
  .gh-tip--left { transform: translate(0, calc(-100% - 7px)); }
  .gh-tip--right { transform: translate(-100%, calc(-100% - 7px)); }

  @media (max-width: 640px) {
    .gh-cal { --gh-gap: 2px; }
    .gh-cal-month { font-size: 0.55rem; letter-spacing: 0.1em; }
  }
`;

export function ContributionCalendar() {
  const [days, setDays] = useState<Day[] | null>(null);
  const [hover, setHover] = useState<HoveredCell | null>(null);
  const [mounted, setMounted] = useState(false);

  // Render the grid only after mount: the calendar frame depends on today's
  // date, and the page is prerendered at build time — so this avoids a
  // hydration mismatch while CSS reserves the space (no layout shift).
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const readCache = (): CachedPayload | null => {
      try {
        const raw = window.localStorage.getItem(CACHE_KEY);
        return raw ? (JSON.parse(raw) as CachedPayload) : null;
      } catch {
        return null;
      }
    };

    const load = async () => {
      const cached = readCache();
      const cachedDays = cached?.days;

      // 1–2. Cache younger than 24h → use it and skip the network.
      if (cachedDays?.length && cached && Date.now() - cached.at < CACHE_TTL_MS) {
        if (!cancelled) setDays(cachedDays);
        return;
      }

      // 3–5. Stale or missing → fetch, cache, and display immediately.
      try {
        const res = await fetch("/api/contributions", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const payload = (await res.json()) as { days?: Day[] };
        if (!payload?.days?.length) throw new Error("empty");
        if (!cancelled) setDays(payload.days);
        try {
          window.localStorage.setItem(
            CACHE_KEY,
            JSON.stringify({ at: Date.now(), days: payload.days } satisfies CachedPayload)
          );
        } catch {
          /* storage unavailable — ignore */
        }
      } catch {
        // 6. GitHub unreachable → keep showing the most recently cached data.
        if (cachedDays?.length) {
          if (!cancelled) setDays(cachedDays);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isLive = days !== null;
  const weeks = useMemo(
    () => (mounted ? groupIntoWeeks(days && days.length ? days : emptyFrameDays()) : []),
    [mounted, days]
  );

  const levelOf = useMemo(
    () =>
      makeLevelFn(
        weeks.flatMap((week) => week.filter((c): c is Day => c !== null).map((c) => c.count))
      ),
    [weeks]
  );

  const monthLabels = useMemo(() => {
    const labels: { week: number; text: string }[] = [];
    weeks.forEach((week, index) => {
      const present = week.filter((c): c is Day => c !== null);
      if (!present.length) return;
      const firstOfMonth = present.find((d) => d.date.slice(8) === "01");
      if (firstOfMonth) {
        // GitHub labels the column where a month begins.
        labels.push({ week: index, text: monthLabel(firstOfMonth.date) });
      } else if (index === 0) {
        // Leading partial month with no 1st in view — still label it.
        labels.push({ week: 0, text: monthLabel(present[0].date) });
      }
    });
    return labels;
  }, [weeks]);

  const totalWeeks = weeks.length;
  const alignmentClass =
    hover === null
      ? ""
      : hover.week <= 2
        ? "gh-tip--left"
        : hover.week >= totalWeeks - 3
          ? "gh-tip--right"
          : "gh-tip--center";

  return (
    <div className="gh-cal" style={{ "--gh-weeks": totalWeeks || WEEKS, position: "relative" } as CSSProperties}>
      <style>{CALENDAR_STYLES}</style>

      <div className="gh-cal-months" aria-hidden="true">
        {monthLabels.map(({ week, text }) => (
          <span
            key={`${week}-${text}`}
            className="gh-cal-month"
            style={{ left: `calc(${week} * (var(--gh-cell) + var(--gh-gap)))` }}
          >
            {text}
          </span>
        ))}
      </div>

      <div
        className="gh-cal-grid"
        role="img"
        aria-label={`GitHub contribution activity over the last ${totalWeeks} weeks`}
      >
        {weeks.map((week, weekIndex) =>
          week.map((cell, dayIndex) => {
            if (!cell) {
              return (
                <span
                  key={`empty-${weekIndex}-${dayIndex}`}
                  className="gh-cell"
                  aria-hidden="true"
                />
              );
            }

            const level = levelOf(cell.count);
            if (!isLive) {
              return (
                <span key={cell.date} className="gh-cell" data-level={level} aria-hidden="true" />
              );
            }

            const summary =
              cell.count === 0
                ? "No contributions"
                : `${cell.count} contribution${cell.count === 1 ? "" : "s"}`;

            return (
              <span
                key={cell.date}
                className="gh-cell gh-cell--live"
                data-level={level}
                aria-label={`${summary} on ${fullDateLabel(cell.date)}`}
                onMouseEnter={(event) => {
                  const el = event.currentTarget;
                  setHover({
                    week: weekIndex,
                    x: el.offsetLeft + el.offsetWidth / 2,
                    y: el.offsetTop,
                    count: cell.count,
                    date: cell.date
                  });
                }}
                onMouseLeave={() => setHover(null)}
              />
            );
          })
        )}

        {hover && (
          <div
            className={`gh-tip ${alignmentClass}`}
            style={{ left: hover.x, top: hover.y }}
          >
            <strong>
              {hover.count === 0
                ? "No contributions"
                : `${hover.count} contribution${hover.count === 1 ? "" : "s"}`}
            </strong>
            <br />
            <em>{fullDateLabel(hover.date)}</em>
          </div>
        )}
      </div>
    </div>
  );
}