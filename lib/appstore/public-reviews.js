import { parseAppStoreUrl } from './url.js';

function decodeJsonString(value) {
  try {
    return JSON.parse(`"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
  } catch {
    return String(value);
  }
}

function buildReviewsPageUrl(appUrl) {
  const { country, appStoreId } = parseAppStoreUrl(appUrl);
  const pageUrl = new URL(`https://apps.apple.com/${country}/app/id${appStoreId}`);
  pageUrl.searchParams.set('see-all', 'reviews');
  pageUrl.searchParams.set('platform', 'iphone');

  return { pageUrl, appStoreId, country };
}

function extractRatingAverage(html) {
  const match = html.match(
    /"aggregateRating"\s*:\s*\{"@type":"AggregateRating","ratingValue":([0-9.]+),"reviewCount":(\d+)/
  );

  if (!match) {
    return { averageRating: 0, ratingCount: 0 };
  }

  return {
    averageRating: Number(match[1]) || 0,
    ratingCount: Number(match[2]) || 0,
  };
}

function extractReviews(html) {
  const reviews = [];
  const pattern =
    /\{"\$kind":"Review","id":"([^"]+)","title":"((?:\\.|[^"])*)","date":"([^"]+)","dateText":"((?:\\.|[^"])*)","contents":"((?:\\.|[^"])*)","rating":(\d+),"reviewerName":"((?:\\.|[^"])*)"(?:,"dateAuthorText":"((?:\\.|[^"])*)")?\}/g;

  for (const match of html.matchAll(pattern)) {
    reviews.push({
      id: decodeJsonString(match[1]),
      title: decodeJsonString(match[2]),
      body: decodeJsonString(match[5]),
      rating: Number(match[6]) || 0,
      author: decodeJsonString(match[7]),
      createdAt: String(match[3]),
      source: 'public-appstore',
      sourceUrl: '',
      territory: '',
      raw: {
        dateText: decodeJsonString(match[4]),
        dateAuthorText: match[8] ? decodeJsonString(match[8]) : '',
      },
    });
  }

  return reviews;
}

export async function fetchPublicAppReviews(appUrl, { limit = 24 } = {}) {
  const { pageUrl, appStoreId, country } = buildReviewsPageUrl(appUrl);

  const response = await fetch(pageUrl, {
    headers: {
      accept: 'text/html,application/xhtml+xml',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
    },
  });

  if (!response.ok) {
    throw new Error(`Public App Store page request failed: ${response.status}`);
  }

  const html = await response.text();
  const reviews = extractReviews(html).slice(0, limit);
  const ratings = extractRatingAverage(html);

  return {
    appStoreId,
    country,
    sourceUrl: pageUrl.toString(),
    reviews,
    ratings,
  };
}
