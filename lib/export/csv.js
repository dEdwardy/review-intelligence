function escapeCsv(value) {
  const text = String(value ?? '');
  if (/[,"\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function buildCsvReport(analysis) {
  const rows = [
    ['type', 'label', 'reviewCount', 'share', 'averageRating', 'summary', 'suggestedAction'],
  ];

  for (const cluster of analysis.issueClusters) {
    rows.push([
      cluster.type,
      cluster.label,
      cluster.reviewCount,
      cluster.share,
      cluster.averageRating.toFixed(2),
      cluster.summary,
      cluster.suggestedAction,
    ]);
  }

  return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
}
