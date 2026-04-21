function bullet(lines) {
  return lines.map((line) => `- ${line}`).join('\n');
}

export function buildMarkdownReport(analysis) {
  const lines = [];
  lines.push(`# ${analysis.primaryApp.name} Review Copilot Report`);
  lines.push('');
  lines.push(`- Time window: ${analysis.timeRangeDays} days`);
  lines.push(`- Ratings filter: ${analysis.ratingFilterLabel}`);
  lines.push(`- Version filter: ${analysis.versionFilterLabel}`);
  lines.push(`- Data mode: ${analysis.mode}`);
  lines.push('');
  lines.push('## Overview');
  lines.push('');
  lines.push(analysis.overview.headline);
  lines.push('');
  lines.push(
    bullet([
      `Reviews analyzed: ${analysis.overview.metrics.totalReviews}`,
      `Average rating: ${analysis.overview.metrics.averageRating.toFixed(1)}/5`,
      `Low ratings: ${analysis.overview.metrics.lowRatingCount}`,
    ])
  );
  lines.push('');
  lines.push('## Issue Clusters');
  lines.push('');

  for (const cluster of analysis.issueClusters) {
    lines.push(`### ${cluster.label}`);
    lines.push('');
    lines.push(
      bullet([
        `Type: ${cluster.type}`,
        `Reviews: ${cluster.reviewCount}`,
        `Share: ${cluster.share}%`,
        `Action: ${cluster.suggestedAction}`,
      ])
    );
    lines.push('');
    lines.push(cluster.summary);
    lines.push('');
    lines.push(`Reply draft: ${cluster.replyDraft}`);
    lines.push('');
  }

  lines.push('## Competitor Gap');
  lines.push('');
  if (analysis.competitorGap.length) {
    for (const item of analysis.competitorGap) {
      lines.push(`- ${item.label} (${item.competitorName}): ${item.summary}`);
    }
  } else {
    lines.push('- No competitor gap analysis was added for this run.');
  }
  lines.push('');
  lines.push('## Weekly Summary');
  lines.push('');
  lines.push(analysis.weeklySummary);
  lines.push('');
  return lines.join('\n');
}
