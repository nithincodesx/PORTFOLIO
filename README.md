# Nithin Krishna | AI Engineer

Dark editorial portfolio built with Next.js 15 App Router, React 19, TypeScript,
Tailwind CSS, Framer Motion, Lenis, and Firebase-backed content editing.

## Requirements

- Node.js `22.14.0` (see `.nvmrc`)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. The public portfolio is served at `/`; `/3d` is
kept as a legacy alias.

Development writes to `.next-dev/`; production builds use `.next/`. This keeps
`npm run build` from corrupting a running development preview.

The top navigation is the single section index (a Menu button on mobile).
Click a project row to reveal its description and inline image; moving the
pointer does not open or dismiss project images. Motion respects the visitor's
reduced-motion preference.

## Checks

```bash
npm run lint       # TypeScript check
npm run build      # Production build
make test          # Offline-friendly project test command
```

The repository includes a Dockerfile for a clean production build:

```bash
docker build -t nithin-portfolio .
docker run --rm -p 3000:3000 --env-file .env.local nithin-portfolio
```

## Configuration

Copy `.env.example` to `.env.local`. The public site works with no Firebase
configuration because it always falls back to `lib/cms/defaults.ts`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Production origin for canonical, sitemap, and OG URLs |
| `GITHUB_USERNAME` | Account used by the contribution calendar |
| `GITHUB_TOKEN` | Optional server-only GitHub GraphQL token |
| `NEXT_PUBLIC_FIREBASE_*` | Firebase web app configuration |
| `NEXT_PUBLIC_ADMIN_EMAILS` | Comma-separated control-panel allowlist |

Never put server tokens or provider secrets in `NEXT_PUBLIC_*` variables.

## Content and CMS

The shipped content lives in `lib/cms/defaults.ts`. When Firebase is configured,
the public page reads `siteConfig/main` and deep-merges it over those defaults.
The private editor is available at `/control` and is intentionally not linked
from the public site, marked `noindex`, and disallowed in `robots.txt`.

Registered editors live in `lib/cms/registry.tsx`; each editor writes only its
own top-level configuration key. The public page renders sections in the order
stored in `config.sections`, including About and Skills.

Project gallery images are auto-detected from `public/project-gallery/` during
the build. Add cleanly named `.png`, `.jpg`, `.webp`, `.gif`, `.avif`, or `.svg`
files there before deploying.

## Firebase rules

After Firebase Authentication and Firestore are configured:

```bash
firebase login
firebase use portfolio-1f115
firebase deploy --only firestore:rules
```

Keep the admin email in `firestore.rules` synchronized with
`NEXT_PUBLIC_ADMIN_EMAILS`.

## Deployment

Set the variables from `.env.example` in the hosting provider, then run:

```bash
npm ci
npm run build
npm run start
```

The sitemap, robots policy, app icon, and Open Graph asset are generated from
`app/sitemap.ts`, `app/robots.ts`, `app/icon.svg`, and
`public/opengraph-image.svg`.
