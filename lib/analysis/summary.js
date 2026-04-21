export function buildOverview(reviews, clusters, appName) {
  const totalReviews = reviews.length;
  const averageRating = totalReviews
    ? reviews.reduce((sum, review) => sum + (Number(review.rating) || 0), 0) / totalReviews
    : 0;
  const lowRatingCount = reviews.filter((review) => Number(review.rating) <= 2).length;

  const issueClusters = clusters.filter((cluster) => cluster.type !== 'praise');
  const praiseClusters = clusters.filter((cluster) => cluster.type === 'praise');
  const topNegative = issueClusters[0];
  const topPraise = praiseClusters[0];

  const headlineParts = [];
  if (topNegative) headlineParts.push(topNegative.label.toLowerCase());
  if (issueClusters[1]) headlineParts.push(issueClusters[1].label.toLowerCase());
  const headline = headlineParts.length
    ? `${appName} reviews are dominated by ${headlineParts.join(' and ')}.`
    : `Reviews for ${appName} look balanced and do not show a dominant complaint pattern.`;

  return {
    headline,
    metrics: {
      totalReviews,
      averageRating,
      lowRatingCount,
      topNegativeLabel: topNegative?.label || 'None',
      topNegativeCount: topNegative?.reviewCount || 0,
      nextActionLabel: topNegative ? `Prioritize ${topNegative.label}` : 'Refine the sample set',
    },
    topPraiseLabel: topPraise?.label || 'None',
  };
}

export function buildWeeklySummary({ appName, overview, issueClusters, competitorGap }) {
  const issueLabels = issueClusters.slice(0, 2).map((cluster) => cluster.label.toLowerCase());
  const gapLabels = competitorGap.slice(0, 2).map((item) => item.label.toLowerCase());
  const leadIssues = issueLabels.length ? issueLabels.join(' and ') : 'no major negative pattern';
  const gapText = gapLabels.length
    ? `Competitors keep surfacing ${gapLabels.join(' and ')}.`
    : 'No competitor gap was added this run.';

  return `${appName} this week: ${leadIssues}. ${overview.headline} ${gapText} Next step: fix the biggest repeated complaint, use the reply draft as a support template, and ship one targeted improvement before the next release.`;
}
