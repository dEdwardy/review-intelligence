import test from 'node:test';
import assert from 'node:assert/strict';

import { parseAppStoreUrl } from '../lib/appstore/url.js';
import { normalizeReviews } from '../lib/analysis/normalize.js';
import { clusterReviews } from '../lib/analysis/cluster.js';
import { buildMarkdownReport } from '../lib/export/markdown.js';

function buildFixtureReviews() {
  return [
    {
      id: 'review-1',
      title: 'Crashes during upload',
      body: 'The app crashes every time I upload a receipt and then I lose progress.',
      rating: 1,
      reviewerNickname: 'Mika',
      createdDate: '2026-04-18T10:00:00Z',
      version: '4.2.0',
    },
    {
      id: 'review-2',
      title: 'Slow sync on startup',
      body: 'Sync is painfully slow on startup and the dashboard hangs for a minute.',
      rating: 2,
      reviewerNickname: 'Tori',
      createdDate: '2026-04-19T10:00:00Z',
      version: '4.2.0',
    },
    {
      id: 'review-3',
      title: 'Very clean workflow',
      body: 'Fast, clean, and reliable. The recent redesign made the workflow much easier.',
      rating: 5,
      reviewerNickname: 'Avery',
      createdDate: '2026-04-20T10:00:00Z',
      version: '4.2.0',
    },
  ];
}

test('parseAppStoreUrl extracts the app id and storefront', () => {
  const result = parseAppStoreUrl('https://apps.apple.com/us/app/example/id1234567890');
  assert.equal(result.appStoreId, '1234567890');
  assert.equal(result.country, 'us');
});

test('clusterReviews groups negative and positive themes', () => {
  const reviews = normalizeReviews(buildFixtureReviews(), {
    appId: '1',
    appName: 'Fixture App',
    source: 'appstore',
  });
  const clusters = clusterReviews(reviews);
  assert.ok(clusters.length >= 2);
  assert.ok(clusters.some((cluster) => cluster.type !== 'praise'));
  assert.ok(clusters.some((cluster) => cluster.type === 'praise'));
});

test('buildMarkdownReport includes key sections', () => {
  const reviews = normalizeReviews(buildFixtureReviews(), {
    appId: '1',
    appName: 'Fixture App',
    source: 'appstore',
  });
  const clusters = clusterReviews(reviews).map((cluster) => ({ ...cluster, replyDraft: 'Draft' }));
  const analysis = {
    primaryApp: {
      name: 'Fixture App',
      appStoreId: '1234567890',
    },
    timeRangeDays: 30,
    ratingFilterLabel: 'All reviews',
    versionFilterLabel: 'Any version',
    mode: 'Public App Store',
    overview: {
      headline: 'Fixture headline',
      metrics: {
        totalReviews: reviews.length,
        averageRating: 3.2,
        lowRatingCount: 3,
      },
    },
    issueClusters: clusters.filter((cluster) => cluster.type !== 'praise'),
    competitorGap: [],
    weeklySummary: 'Weekly summary',
  };
  const markdown = buildMarkdownReport(analysis);
  assert.match(markdown, /# /);
  assert.match(markdown, /## Issue Clusters/);
  assert.match(markdown, /## Weekly Summary/);
});
