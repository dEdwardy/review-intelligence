import { buildAppStoreUrl, parseAppStoreUrl } from './url.js';

const REVIEW_FEED_PAGE_SIZE = 50;
const DEFAULT_LIMIT = 100;
const MAX_FEED_PAGES = 3;
const REQUEST_TIMEOUT_MS = 15000;
const REQUEST_RETRY_DELAY_MS = 500;

const REQUEST_HEADERS = {
  accept: 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0 Safari/537.36',
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithRetry(input, init, parser, { attempts = 2 } = {}) {
  let lastError;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(input, {
        ...init,
        signal: controller.signal,
      });

      if (!response.ok) {
        const shouldRetry = response.status === 429 || response.status >= 500;
        if (shouldRetry && attempt < attempts - 1) {
          await sleep(REQUEST_RETRY_DELAY_MS);
          continue;
        }

        throw new Error(`Request failed with ${response.status}.`);
      }

      return await parser(response);
    } catch (error) {
      lastError = error;
      const shouldRetry =
        attempt < attempts - 1 && (error?.name === 'AbortError' || error instanceof TypeError);

      if (!shouldRetry) {
        throw error;
      }

      await sleep(REQUEST_RETRY_DELAY_MS);
    } finally {
      clearTimeout(timer);
    }
  }

  throw lastError || new Error('Request failed.');
}

function buildReviewsPageUrl(appUrl) {
  const { country, appStoreId } = parseAppStoreUrl(appUrl);
  const pageUrl = new URL(buildAppStoreUrl({ country, appStoreId }));
  pageUrl.searchParams.set('see-all', 'reviews');
  pageUrl.searchParams.set('platform', 'iphone');

  return { pageUrl, appStoreId, country };
}

function buildReviewFeedUrl({ appStoreId, country, page }) {
  const feedUrl = new URL(
    `https://itunes.apple.com/rss/customerreviews/page=${page}/id=${appStoreId}/sortby=mostrecent/json`
  );
  feedUrl.searchParams.set('l', 'en');
  feedUrl.searchParams.set('cc', country);
  return feedUrl;
}

function extractAggregateRatingFromHtml(html) {
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

function extractInlineJsonPayload(html) {
  const scripts = [...html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)].map((match) =>
    match[1].trim()
  );

  return scripts.find(
    (script) => script.startsWith('{"data":') && script.includes('"SeeAllPageIntent"')
  );
}

function getReviewPageData(payload) {
  const pageEntry =
    payload?.data?.find?.((entry) => entry?.intent?.['see-all'] === 'reviews') ||
    payload?.data?.[0];

  return pageEntry?.data?.shelfMapping?.productRatings?.seeAllAction?.pageData || null;
}

function mapPageReviewItem(item) {
  return {
    id: String(item.id || ''),
    title: String(item.title || '').trim(),
    body: String(item.contents || '').trim(),
    rating: Number(item.rating) || 0,
    author: String(item.reviewerName || 'Anonymous').trim(),
    createdAt: String(item.date || '').trim(),
    version: '',
    territory: '',
    source: 'appstore-public-page',
    raw: item,
  };
}

function extractRatingsFromPageData(pageData) {
  const ratingBlock = pageData?.shelves
    ?.flatMap((shelf) => shelf?.items || [])
    ?.find((item) => item?.ratings?.ratingAverage)?.ratings;

  if (!ratingBlock) {
    return { averageRating: 0, ratingCount: 0 };
  }

  return {
    averageRating: Number(ratingBlock.ratingAverage) || 0,
    ratingCount: Number(ratingBlock.totalNumberOfRatings) || 0,
  };
}

function extractReviewsFromPageHtml(html) {
  const inlinePayload = extractInlineJsonPayload(html);
  if (!inlinePayload) {
    return {
      ratings: extractAggregateRatingFromHtml(html),
      reviews: [],
    };
  }

  let payload;
  try {
    payload = JSON.parse(inlinePayload);
  } catch {
    return {
      ratings: extractAggregateRatingFromHtml(html),
      reviews: [],
    };
  }

  const pageData = getReviewPageData(payload);
  const reviews =
    pageData?.shelves
      ?.flatMap((shelf) => shelf?.items || [])
      ?.filter(
        (item) =>
          item?.$kind === 'Review' ||
          (item?.id && item?.title && item?.contents && item?.rating && item?.reviewerName)
      )
      ?.map(mapPageReviewItem) || [];

  const ratings = extractRatingsFromPageData(pageData);
  const aggregateRatings = extractAggregateRatingFromHtml(html);

  return {
    ratings: {
      averageRating: ratings.averageRating || aggregateRatings.averageRating,
      ratingCount: ratings.ratingCount || aggregateRatings.ratingCount,
    },
    reviews,
  };
}

function mapFeedEntry(entry) {
  return {
    id: String(entry?.id?.label || ''),
    title: String(entry?.title?.label || '').trim(),
    body: String(entry?.content?.label || '').trim(),
    rating: Number(entry?.['im:rating']?.label) || 0,
    author: String(entry?.author?.name?.label || 'Anonymous').trim(),
    createdAt: String(entry?.updated?.label || '').trim(),
    version: String(entry?.['im:version']?.label || '').trim(),
    territory: '',
    source: 'appstore-public-feed',
    raw: entry,
  };
}

async function fetchReviewsFromFeed({ appStoreId, country, limit, seenIds }) {
  const reviews = [];

  for (let page = 1; reviews.length < limit && page <= MAX_FEED_PAGES; page += 1) {
    const data = await requestWithRetry(
      buildReviewFeedUrl({ appStoreId, country, page }),
      { headers: REQUEST_HEADERS },
      async (response) => response.json()
    );

    const entries = Array.isArray(data?.feed?.entry) ? data.feed.entry : [];
    if (!entries.length) {
      break;
    }

    const pageReviews = entries
      .map(mapFeedEntry)
      .filter((review) => review.id && !seenIds.has(review.id));

    if (!pageReviews.length && entries.length < REVIEW_FEED_PAGE_SIZE) {
      break;
    }

    pageReviews.forEach((review) => {
      seenIds.add(review.id);
      reviews.push(review);
    });

    if (entries.length < REVIEW_FEED_PAGE_SIZE) {
      break;
    }
  }

  return reviews.slice(0, limit);
}

async function fetchReviewsFromPublicPage({ pageUrl, appStoreId }) {
  const pageResponse = await requestWithRetry(
    pageUrl,
    {
      headers: REQUEST_HEADERS,
      redirect: 'follow',
    },
    async (response) => ({
      body: await response.text(),
      url: response.url,
    })
  );

  const isExpectedAppPage =
    pageResponse.url.includes(`/id${appStoreId}`) ||
    pageResponse.body.includes(`"id":"${appStoreId}"`);

  if (!isExpectedAppPage) {
    return {
      ratings: { averageRating: 0, ratingCount: 0 },
      reviews: [],
      sourceUrl: pageUrl.toString(),
    };
  }

  const parsed = extractReviewsFromPageHtml(pageResponse.body);

  return {
    ...parsed,
    sourceUrl: pageUrl.toString(),
  };
}

export async function fetchPublicAppReviews(appUrl, { limit = DEFAULT_LIMIT } = {}) {
  const { pageUrl, appStoreId, country } = buildReviewsPageUrl(appUrl);

  const feedReviews = await fetchReviewsFromFeed({
    appStoreId,
    country,
    limit,
    seenIds: new Set(),
  }).catch(() => []);

  if (feedReviews.length) {
    return {
      appStoreId,
      country,
      sourceUrl: pageUrl.toString(),
      reviews: feedReviews,
      ratings: {
        averageRating: 0,
        ratingCount: feedReviews.length,
      },
    };
  }

  const pageResult = await fetchReviewsFromPublicPage({ pageUrl, appStoreId });

  if (!pageResult.reviews.length) {
    throw new Error(`No public App Store reviews were found for app ${appStoreId}.`);
  }

  return {
    appStoreId,
    country,
    sourceUrl: pageResult.sourceUrl,
    reviews: pageResult.reviews.slice(0, limit),
    ratings: pageResult.ratings,
  };
}
