import { NextResponse } from "next/server";

/**
 * Server-only endpoint that returns REAL GitHub contribution data for a user.
 *
 * Why a route handler:
 *  - GitHub's contribution counts are not available from a plain browser fetch,
 *    and the GraphQL API needs authentication. Doing this server-side keeps any
 *    token out of the client bundle entirely.
 *
 * Data sources (in order):
 *  1. GitHub GraphQL API — used when GITHUB_TOKEN is present (official, stable).
 *  2. GitHub public contributions page — no auth required, used as a fallback.
 *
 * Caching: results are cached in-memory for 24h and also served with long
 * CDN cache headers, so GitHub is never polled continuously.
 */

export const dynamic = "force-dynamic";
export const revalidate = 0;

const DEFAULT_USERNAME = "nithincodesx";
/** ~6 months of week columns. */
const WEEKS = 27;
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 9000;
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

const GITHUB_USERNAME = (process.env.GITHUB_USERNAME || DEFAULT_USERNAME).trim();
/** Server-side only. Never referenced in client code. */
const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || "").trim();

type Day = { date: string; count: number };
type Payload = { username: string; generatedAt: string; days: Day[] };

let cache: { username: string; at: number; payload: Payload } | null = null;

/* ── Date helpers — UTC only, never shifted by local timezone ────────────── */
function utcWeekday(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

function todayUtc(): string {
  const n = new Date();
  const mm = String(n.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(n.getUTCDate()).padStart(2, "0");
  return `${n.getUTCFullYear()}-${mm}-${dd}`;
}

function sortAscending(days: Day[]): Day[] {
  return [...days].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}

/** Keep ~6 months, aligned so the first column is a Sunday. */
function windowToSixMonths(days: Day[]): Day[] {
  const today = todayUtc();
  const sorted = sortAscending(days).filter((d) => d.date <= today);
  if (sorted.length <= WEEKS * 7) return sorted;

  let start = sorted.length - WEEKS * 7;
  while (start > 0 && utcWeekday(sorted[start].date) !== 0) start -= 1;

  let windowed = sorted.slice(start);
  // Drop one full week (keeps Sunday alignment) if we overshot the target.
  if (windowed.length > WEEKS * 7) windowed = windowed.slice(7);
  return windowed;
}

/* ── Source 1: GitHub GraphQL (authenticated, optional) ──────────────────── */
const GRAPHQL_QUERY = `query($login: String!) {
  user(login: $login) {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays { date contributionCount }
        }
      }
    }
  }
}`;

type GraphQLResponse = {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: { contributionDays?: { date: string; contributionCount: number }[] }[];
        };
      };
    };
  };
  errors?: unknown;
};

async function fetchGraphQL(username: string): Promise<Day[]> {
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
      "User-Agent": USER_AGENT
    },
    body: JSON.stringify({ query: GRAPHQL_QUERY, variables: { login: username } }),
    cache: "no-store",
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  });

  if (!res.ok) throw new Error(`graphql_${res.status}`);

  const json = (await res.json()) as GraphQLResponse;
  if (json.errors || !json.data?.user) throw new Error("graphql_error");

  const weeks = json.data.user.contributionsCollection?.contributionCalendar?.weeks ?? [];
  const days: Day[] = [];
  for (const week of weeks) {
    for (const day of week.contributionDays ?? []) {
      days.push({ date: day.date, count: day.contributionCount ?? 0 });
    }
  }
  return days;
}

/* ── Source 2: public contributions page (no auth needed) ────────────────── */
/** Map a GitHub level (0–4) to a representative count, used only if counts can't be parsed. */
const LEVEL_TO_COUNT = [0, 1, 2, 3, 4];

function parseContributionsHtml(html: string): Day[] {
  const dates: string[] = [];
  const levels: number[] = [];

  const tdRe = /<td\b([^>]*)>/g;
  let match: RegExpExecArray | null;
  while ((match = tdRe.exec(html))) {
    const attrs = match[1];
    const dateMatch = attrs.match(/data-date="([^"]+)"/);
    if (!dateMatch) continue;
    const levelMatch = attrs.match(/data-level="(\d)"/);
    dates.push(dateMatch[1]);
    levels.push(levelMatch ? Number(levelMatch[1]) : 0);
  }

  // Each cell's tooltip carries the real count, e.g. "10 contributions on April 12th."
  const counts: number[] = [];
  const tipRe = /<tool-tip\b[^>]*>([\s\S]*?)<\/tool-tip>/g;
  while ((match = tipRe.exec(html))) {
    const text = match[1].replace(/\s+/g, " ").trim();
    const numbered = text.match(/([\d,]+)\s+contributions?\s+on\b/i);
    if (numbered) counts.push(Number(numbered[1].replace(/,/g, "")));
    else if (/No contributions\s+on\b/i.test(text)) counts.push(0);
  }

  const countsReliable =
    counts.length === dates.length &&
    counts.filter((c, i) => c > 0 !== (levels[i] ?? 0) > 0).length < dates.length * 0.05;

  return dates.map((date, i) => ({
    date,
    count: countsReliable ? counts[i] : LEVEL_TO_COUNT[levels[i] ?? 0] ?? 0
  }));
}

async function fetchPublicHtml(username: string): Promise<Day[]> {
  const res = await fetch(
    `https://github.com/users/${encodeURIComponent(username)}/contributions`,
    {
      headers: { "User-Agent": USER_AGENT, Accept: "text/html", "Accept-Language": "en-US,en" },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
    }
  );

  if (!res.ok) throw new Error(`contributions_${res.status}`);
  return parseContributionsHtml(await res.text());
}

/* ── Handler ─────────────────────────────────────────────────────────────── */
function cacheHeaders(): Record<string, string> {
  return {
    "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800"
  };
}

export async function GET(request: Request) {
  const requested = new URL(request.url).searchParams.get("username");
  const username =
    requested && /^[A-Za-z0-9-]{1,39}$/.test(requested) ? requested : GITHUB_USERNAME;

  const isSameUser = cache?.username.toLowerCase() === username.toLowerCase();
  if (cache && isSameUser && Date.now() - cache.at < CACHE_TTL_MS) {
    return NextResponse.json(cache.payload, { headers: cacheHeaders() });
  }

  const sources: Array<() => Promise<Day[]>> = [];
  if (GITHUB_TOKEN) sources.push(() => fetchGraphQL(username));
  sources.push(() => fetchPublicHtml(username));

  let days: Day[] | null = null;
  let lastError = "unavailable";

  for (const source of sources) {
    try {
      const windowed = windowToSixMonths(await source());
      if (windowed.length) {
        days = windowed;
        break;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : "unavailable";
    }
  }

  if (!days) {
    // Serve the most recent cached data if GitHub is unreachable.
    if (cache && isSameUser) {
      return NextResponse.json(cache.payload, { headers: cacheHeaders() });
    }
    return NextResponse.json(
      { error: "github_unavailable", detail: lastError },
      { status: 502 }
    );
  }

  const payload: Payload = { username, generatedAt: new Date().toISOString(), days };
  cache = { username, at: Date.now(), payload };
  return NextResponse.json(payload, { headers: cacheHeaders() });
}