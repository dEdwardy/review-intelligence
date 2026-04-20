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

The app reads public App Store review data directly from Apple:

- public App Store page HTML with embedded review JSON
- public iTunes lookup metadata
- public customer review feed for recent review pagination

No Apple developer credentials, demo fixtures, or mock review generators are used in the live analysis path.

## Project layout

- `app/` routes and layout
- `components/` UI pieces
- `lib/` analysis, App Store, and export logic
- `scripts/` utility scripts
- `tests/` unit tests

## Docs

The original MVP brief is kept in `docs/`.
