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
npm install
npm run dev
```

Open `http://localhost:3000`.

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
