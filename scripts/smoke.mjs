import { runAnalysis } from '../lib/analysis/index.js';

const appUrl = process.argv[2];
const competitorUrls = process.argv.slice(3);

if (!appUrl) {
  console.error('Usage: node scripts/smoke.mjs <app-store-url> [competitor-url ...]');
  process.exit(1);
}

const analysis = await runAnalysis({
  appUrl,
  competitorUrls,
  timeRangeDays: 30,
  ratingFilter: 'all',
  versionFilter: 'all',
});

console.log(analysis.overview.headline);
console.log('');
console.log(
  analysis.issueClusters
    .slice(0, 3)
    .map((cluster) => `${cluster.label}: ${cluster.reviewCount}`)
    .join('\n')
);
