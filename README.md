# Review Copilot

Minimal MVP for App Store review intelligence.

## What it does

- Paste one App Store link.
- Optionally add up to three competitors.
- See review clusters, reply drafts, competitor gaps, and exportable summaries.

## Run

```bash
npm install
npm run dev
```

## Scripts

- `npm run dev` start the app locally
- `npm run build` create a production build
- `npm run start` run the production server
- `npm run test` run the unit tests

## Data source

The app reads public App Store review pages and App Store metadata directly from Apple.
No Apple developer credentials are required for this version.

## Project layout

- `app/` routes and layout
- `components/` UI pieces
- `lib/` analysis, App Store, and export logic
- `scripts/` utility scripts
- `tests/` unit tests

## Docs

The original MVP brief is kept in `docs/`.
