# Nithin Krishna AI Engineer Portfolio

Premium light-themed portfolio built with Next.js 15, React 19, TypeScript, Tailwind CSS, Framer Motion, Three.js, React Three Fiber, and Drei.

## Features

- Studio-style hero on a dark cloud backdrop with a macOS browser frame, inside which a mini landing page hosts a live 3D AI orb (rings, sparkles, floating geometry).
- Alternating light/dark sections with oversized watermark typography.
- Numbered, expandable **Work** list, accordion **Service** rows, and a table-style **Experience** section.
- Contact section with credentials, socials, résumé download, and a direct email CTA.
- Lazy-loaded 3D scene — the Three.js bundle is split out so first paint stays fast (~155 kB First Load JS).
- Responsive, typed, and componentized App Router architecture.

## Run Locally

```bash
nvm use
npm install
npm run dev
```

Open `http://localhost:3000`.

Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS origin (see `.env.example`) so
canonical, sitemap, and Open Graph URLs use the production domain.

## Checks and deployment

The pinned runtime is Node.js `22.14.0` (`.nvmrc`). The lockfile is committed,
and the offline-friendly typecheck is available through the Makefile:

```bash
make test
```

Build and run the production image with Docker:

```bash
docker build -t nithin-portfolio .
docker run --rm -p 3000:3000 --env-file .env.local nithin-portfolio
```

For a direct deployment, run `npm run build` and `npm run start` on a Node.js
22.14.0 host, then configure the environment variables from `.env.example`.

## GitHub Contribution Calendar

The hero renders a live, GitHub-style contribution calendar for the account in
`GITHUB_USERNAME` (defaults to `nithincodesx`).

- Data is fetched **server-side** from `app/api/contributions`, so no token is
  ever exposed to the browser.
- Out of the box it uses GitHub's public contributions page (no auth). Set
  `GITHUB_TOKEN` (server-side only — see `.env.example`) to use the official
  GraphQL API instead.
- Results are cached for 24 hours (server memory + browser `localStorage`), so
  GitHub is never polled continuously. New contributions appear automatically
  within a day — no code edit or redeploy required.

## Customize

Update portfolio content in `lib/portfolio-data.ts` and the data types in `types/portfolio.ts`. Replace placeholder links, email, GitHub, LinkedIn, and `/resume.pdf` with your real assets when ready.

## Admin Control Panel (/control)

A private CMS for the portfolio lives at **`/control`** (not linked anywhere in the public
navbar, footer, or navigation; marked `noindex` and disallowed in `robots.txt`).

### Architecture

| Piece | Location |
| --- | --- |
| Editable-content schema | `lib/cms/types.ts` (`SiteConfig`) |
| Shipped defaults (= original hardcoded content) | `lib/cms/defaults.ts` |
| Firestore loader + deep merge (falls back to defaults) | `lib/cms/load.ts` |
| Editor registry (sidebar entries + field definitions) | `lib/cms/registry.tsx` |
| Public read/save provider | `components/cms/site-config-provider.tsx` |
| Firebase web init | `lib/firebase/client.ts` |
| Auth context (email allowlist, fail-closed) | `components/control/auth-provider.tsx` |
| Route guard | `app/control/(panel)/layout.tsx` |
| Dashboard / sidebar / generic editor | `app/control/*`, `components/control/*` |
| Firestore rules (public read, admin-only write, default-deny) | `firestore.rules` |

Content is stored in one Firestore document: **`siteConfig/main`**. Each editor saves only its
own top-level key with a partial merge (`hero`, `projects`, `theme`, `music`, `sections`, …).

The public site renders from `SiteConfigProvider`, which starts on the defaults and deep-merges
the Firestore document when it loads — so the site looks and works exactly the same even before
Firebase is configured, if the fetch fails, or if fields are missing.

**Adding a new editor** = add one entry to `EDITOR_SECTIONS` in `lib/cms/registry.tsx`
(fields + icon + group). The `/control/<slug>` route, sidebar link, and dashboard tile are
generated automatically.

### One-time setup

1. Create a Firebase project → enable **Authentication → Email/Password** → add a **Web app**.
2. Copy the web config into `.env.local` (see `.env.example`): `NEXT_PUBLIC_FIREBASE_API_KEY`,
   `..._AUTH_DOMAIN`, `..._PROJECT_ID`, `..._STORAGE_BUCKET`, `..._MESSAGING_SENDER_ID`,
   `..._APP_ID`.
3. Set `NEXT_PUBLIC_ADMIN_EMAILS` to your login email (comma-separated for multiple admins).
4. Create the user in **Firebase Authentication → Users**.
5. Deploy the security rules (the admin email inside `firestore.rules` must match yours):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use <your-project-id>
   firebase deploy --only firestore:rules
   ```

6. Visit `yourdomain.com/control` and sign in.

### Security notes

- Security does **not** rely on hiding the URL: the guard verifies a real Firebase session and
  the admin allowlist; unauthorized visitors are signed out and redirected away.
- Firestore rules are the real data protection: writes require the signed-in admin email;
  everything else in the database is denied by default.
- `NEXT_PUBLIC_FIREBASE_*` values are public by design (they only identify the project).
  No credentials or secrets ship in the frontend; `GITHUB_TOKEN` stays server-only.
- If Firebase is not configured yet, `/control/login` shows setup instructions and the public
  site silently runs on defaults — nothing breaks.
