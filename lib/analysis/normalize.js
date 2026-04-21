export function normalizeReviews(reviews = [], { appId, appName, source = 'unknown' } = {}) {
  return reviews.filter(Boolean).map((review, index) => {
    const attributes = review.attributes || review;
    const title = String(attributes.title || review.title || '').trim();
    const body = String(attributes.body || review.body || review.text || '').trim();
    const text = `${title} ${body}`.trim();
    const rating = Number(attributes.rating || review.rating) || 0;
    const sentiment = rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'mixed';

    return {
      id: String(review.id || `${appId || 'review'}-${index}`),
      appId: String(appId || review.appId || ''),
      appName: String(appName || review.appName || ''),
      title,
      body,
      text,
      rating,
      version: String(attributes.version || review.version || review.appVersion || '').trim(),
      author: String(
        attributes.reviewerNickname ||
          review.author ||
          review.reviewerNickname ||
          review.authorName ||
          'Anonymous'
      ),
      createdAt: String(
        attributes.createdDate || review.createdAt || review.createdDate || ''
      ).slice(0, 10),
      source: String(review.source || source || 'unknown'),
      territory: String(attributes.territory || review.territory || review.countryCode || ''),
      sentiment,
      raw: review,
    };
  });
}
