import { parseAppStoreUrl } from '../appstore/url.js';
import { fetchAppMetadata } from '../appstore/itunes.js';
import { fetchPublicAppReviews } from '../appstore/public-reviews.js';
import { normalizeReviews } from './normalize.js';
import { clusterReviews, splitClusters } from './cluster.js';
import { generateReplyDraft } from './replies.js';
import { buildOverview, buildWeeklySummary } from './summary.js';

function filterByWindow(reviews, timeRangeDays) {
  const cutoff = Date.now() - timeRangeDays * 24 * 60 * 60 * 1000;
  return reviews.filter((review) => {
    if (!review.createdAt) return true;
    const timestamp = new Date(review.createdAt).getTime();
    return Number.isNaN(timestamp) ? true : timestamp >= cutoff;
  });
}

function filterByVersion(reviews, versionFilter, currentVersion) {
  if (versionFilter !== 'current' || !currentVersion) return reviews;
  return reviews.filter((review) => review.version && review.version === currentVersion);
}

function filterByRatings(reviews, ratingFilter) {
  if (!ratingFilter || ratingFilter === 'all') return reviews;
  const allowed = ratingFilter
    .split(',')
    .map((value) => Number(value.trim()))
    .filter(Boolean);
  return reviews.filter((review) => allowed.includes(Number(review.rating)));
}

function labelForRatingFilter(ratingFilter) {
  if (!ratingFilter || ratingFilter === 'all') return 'All reviews';
  if (ratingFilter === '1,2') return '1-2 stars';
  if (ratingFilter === '3') return '3 stars';
  return ratingFilter;
}

function labelForVersionFilter(versionFilter) {
  if (versionFilter === 'current') return 'Current version';
  return 'Any version';
}

async function loadApp(appUrl, { strict = true } = {}) {
  const parsed = parseAppStoreUrl(appUrl);

  try {
    const [metadata, publicReviews] = await Promise.all([
      fetchAppMetadata(appUrl, { defaultName: parsed.appStoreId }).catch(() => ({
        appStoreId: parsed.appStoreId,
        country: parsed.country,
        name: parsed.appStoreId,
        bundleId: '',
        iconUrl: '',
        sellerName: '',
        currentVersion: '',
        averageRating: 0,
        ratingCount: 0,
        appUrl,
        genre: '',
      })),
      fetchPublicAppReviews(appUrl, { limit: 24 }),
    ]);

    const reviews = normalizeReviews(publicReviews.reviews, {
      appId: metadata.appStoreId,
      appName: metadata.name,
      source: 'public-appstore',
    });

    return {
      metadata: {
        ...metadata,
        averageRating: publicReviews.ratings.averageRating || metadata.averageRating,
        ratingCount: publicReviews.ratings.ratingCount || metadata.ratingCount,
        appUrl: publicReviews.sourceUrl,
      },
      reviews,
      sourceUrl: publicReviews.sourceUrl,
    };
  } catch (error) {
    if (strict) {
      throw error;
    }

    return null;
  }
}

function loadReviewsForApp(app, { timeRangeDays, ratingFilter, versionFilter }) {
  let reviews = app.reviews;
  reviews = filterByWindow(reviews, timeRangeDays);
  reviews = filterByRatings(reviews, ratingFilter);
  reviews = filterByVersion(reviews, versionFilter, app.metadata.currentVersion);
  return reviews;
}

function attachReplyDrafts(clusters, appName) {
  return clusters.map((cluster) => ({
    ...cluster,
    replyDraft: generateReplyDraft(cluster, appName),
  }));
}

function buildCompetitorGap(primaryClusters, competitorApps) {
  if (!competitorApps.length) {
    return [];
  }

  const primaryLabels = new Set(primaryClusters.map((cluster) => cluster.topicKey));
  const competitorGaps = [];

  competitorApps.forEach((competitor) => {
    competitor.issueClusters.forEach((cluster) => {
      if (primaryLabels.has(cluster.topicKey)) {
        return;
      }

      competitorGaps.push({
        id: `${competitor.metadata.appStoreId}-${cluster.topicKey}`,
        label: cluster.label,
        competitorName: competitor.metadata.name,
        competitorCount: cluster.reviewCount,
        statusLabel: 'Watch',
        summary: `Competitor reviews show repeated complaints about ${cluster.label.toLowerCase()}, but your current set does not show the same pattern.`,
        action: `Use this as a watchlist item and keep it from becoming a repeated complaint in ${competitor.metadata.name}.`,
      });
    });
  });

  return competitorGaps.slice(0, 6);
}

export async function runAnalysis({
  appUrl,
  competitorUrls = [],
  timeRangeDays = 30,
  ratingFilter = 'all',
  versionFilter = 'all',
}) {
  parseAppStoreUrl(appUrl);

  const primaryApp = await loadApp(appUrl, { strict: true });
  const primaryReviews = loadReviewsForApp(primaryApp, {
    timeRangeDays,
    ratingFilter,
    versionFilter,
  });

  const primaryClusters = attachReplyDrafts(
    clusterReviews(primaryReviews),
    primaryApp.metadata.name
  );
  const overview = buildOverview(primaryReviews, primaryClusters, primaryApp.metadata.name);
  const splitPrimary = splitClusters(primaryClusters);

  const competitors = (
    await Promise.all(
      competitorUrls.filter(Boolean).map(async (competitorUrl) => {
        const app = await loadApp(competitorUrl, { strict: false });
        if (!app) {
          return null;
        }

        const reviews = loadReviewsForApp(app, {
          timeRangeDays,
          ratingFilter,
          versionFilter,
        });
        const clusters = attachReplyDrafts(clusterReviews(reviews), app.metadata.name);

        return {
          ...app,
          reviews,
          clusters,
          ...splitClusters(clusters),
        };
      })
    )
  ).filter(Boolean);

  const competitorGap = buildCompetitorGap(splitPrimary.issueClusters, competitors);
  const weeklySummary = buildWeeklySummary({
    appName: primaryApp.metadata.name,
    overview,
    issueClusters: splitPrimary.issueClusters,
    competitorGap,
  });

  const totalReviews =
    primaryReviews.length + competitors.reduce((sum, item) => sum + item.reviews.length, 0);

  return {
    mode: 'Public App Store data',
    timeRangeDays,
    ratingFilter,
    versionFilter,
    ratingFilterLabel: labelForRatingFilter(ratingFilter),
    versionFilterLabel: labelForVersionFilter(versionFilter),
    totalReviews,
    primaryApp: primaryApp.metadata,
    primaryReviews,
    issueClusters: splitPrimary.issueClusters,
    praiseClusters: splitPrimary.praiseClusters,
    competitors,
    competitorGap,
    overview,
    weeklySummary,
  };
}
