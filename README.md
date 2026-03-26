# GHCD - GitHub Contributions Dashboard

Compare GitHub contribution heatmaps and stats for multiple users side by side.

**Live:** [ghcd.io](https://ghcd.io)

## What it does

GHCD fetches contribution data from GitHub's GraphQL API and displays it as a dashboard with:

- **Contribution heatmaps** — GitHub-style green squares for each user, with interactive tooltips
- **Stats bar** — commits, PRs, reviews, issues, repos, and streak — toggleable in settings
- **Badges** — auto-awarded to the top performer in each category (Commit Captain, PR Pro, Review Ruler, etc.)
- **Streak tracking** — longest and current streak with a glow effect on active streaks
- **User detail modal** — click a card for insights, day-of-week breakdown, top repos, and more
- **Organization filtering** — scope contributions to a specific GitHub org
- **Date presets** — quick filters (7d, 30d, 90d, YTD, this year, last 12 months) plus custom ranges
- **Shareable URLs** — config (users, org, dates) is encoded in the URL
- **Export as image** — screenshot the dashboard to share
- **Dark / light / system theme** — toggle in the toolbar
- **Keyboard shortcuts** — `R` to refetch, `S` to toggle settings
- **Mobile responsive** — single column layout with full-screen settings drawer

## Setup

You need a [GitHub Personal Access Token](https://github.com/settings/tokens) with the `read:user` and `read:org` scopes. The token is stored in your browser's `localStorage` and never leaves your machine.

## Getting started

```sh
bun install
bun run dev
```

Open [localhost:5173](http://localhost:5173/), click the gear icon to add your PAT and some GitHub usernames, then hit **Fetch**.

## Commands

```sh
bun run dev        # start dev server
bun run build      # typecheck + production build
bun run lint       # biome check (lint + format)
bun run lint:fix   # auto-fix lint + format issues
bun run format     # format only
```

## Stack

- **Runtime:** Bun
- **Framework:** React 19 + TypeScript
- **Build:** Vite
- **Styling:** Tailwind CSS 3
- **Linting:** Biome
- **CI:** GitHub Actions (lint, typecheck, build)
- **API:** GitHub GraphQL (client-side, no backend)

## Deploy

Deployed to GitHub Pages at [ghcd.io](https://ghcd.io) via GitHub Actions on push to `main`.

```sh
bun run build   # produces dist/
```
