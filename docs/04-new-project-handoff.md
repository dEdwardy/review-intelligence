# New Project Handoff

Updated: 2026-04-20

## 1. Project Summary

Build a lightweight app called `Review Copilot` for App Store review intelligence.

The product helps indie developers read public App Store reviews, identify repeated issues, compare competitor complaints, and generate reply drafts plus a short action summary.

## 2. Recommended Scope

- Input one public App Store URL
- Optionally input up to 3 competitor App Store URLs
- Fetch public reviews from Apple pages
- Normalize and cluster reviews into themes such as bug, UX, pricing, performance, feature request, and support
- Show top issue clusters with counts and summaries
- Generate reply drafts for common negative reviews
- Export a Markdown report and CSV report

## 3. Data Source

- Public App Store review pages for review text
- iTunes Search API for app metadata

No Apple developer credentials are required for the current version.

## 4. Keep Out of v1

- Full ASO platform features
- Keyword rank tracking
- Download or revenue analytics
- Team collaboration
- Multi-platform review aggregation
- Login and subscription flows

## 5. Implementation Notes

- Keep the UI fast and action-oriented
- Prefer concise issue summaries over dashboard-style charts
- Surface empty states and fetch errors clearly instead of substituting placeholder data
- Preserve the export flow so teams can reuse the output immediately

## 6. Folder Layout

```text
review-intelligence/
  app/
  components/
  lib/
    appstore/
    analysis/
    export/
  public/
  scripts/
  tests/
```

## 7. Next Steps

1. Validate the public review fetcher against a few real App Store pages.
2. Tighten the UI copy so it feels like a real product, not a prototype.
3. Keep the deployment flow simple and repeatable.
