const RULES = [
  {
    key: 'bug-crash',
    label: 'Crash on launch',
    type: 'bug',
    keywords: [/crash/i, /freeze/i, /hang/i, /force close/i, /won't open/i, /stuck/i],
    suggestedAction:
      'Investigate startup stability, add crash logging, and post a short fix note in the next release.',
  },
  {
    key: 'bug-sync',
    label: 'Sync failures',
    type: 'bug',
    keywords: [/sync/i, /duplicate/i, /icloud/i, /backup/i, /lost/i, /restore/i],
    suggestedAction:
      'Prioritize sync reliability and add a targeted response for data-loss reports.',
  },
  {
    key: 'perf-slow',
    label: 'Slow performance',
    type: 'performance',
    keywords: [/slow/i, /lag/i, /stutter/i, /loading/i, /battery/i, /drain/i],
    suggestedAction:
      'Profile the slow path and reduce visible wait states before adding new features.',
  },
  {
    key: 'pricing-plan',
    label: 'Subscription pressure',
    type: 'pricing',
    keywords: [/price/i, /expensive/i, /subscription/i, /trial/i, /paywall/i, /refund/i, /cost/i],
    suggestedAction:
      'Revisit pricing copy, trial length, and value framing before pushing for upgrades.',
  },
  {
    key: 'ux-navigation',
    label: 'Confusing navigation',
    type: 'ux',
    keywords: [
      /confusing/i,
      /hard to use/i,
      /too many taps/i,
      /navigation/i,
      /menu/i,
      /layout/i,
      /crowded/i,
    ],
    suggestedAction:
      'Simplify the primary flow and remove one layer of navigation from the most common task.',
  },
  {
    key: 'feature-export',
    label: 'Missing export / sharing',
    type: 'feature request',
    keywords: [/export/i, /share/i, /markdown/i, /csv/i, /pdf/i, /copy/i, /download/i],
    suggestedAction: 'Ship a direct export path and make the copy-to-clipboard flow obvious.',
  },
  {
    key: 'feature-request',
    label: 'Feature requests',
    type: 'feature request',
    keywords: [
      /please add/i,
      /would love/i,
      /wish/i,
      /need/i,
      /could you/i,
      /missing/i,
      /feature/i,
    ],
    suggestedAction:
      'Capture the request in a roadmap bucket and reply with a concise acknowledgement.',
  },
  {
    key: 'support-response',
    label: 'Support response gaps',
    type: 'support',
    keywords: [/support/i, /reply/i, /email/i, /help/i, /developer/i, /response/i],
    suggestedAction: 'Create a standard support reply path and link the contact channel in-app.',
  },
];

function pickRule(text, rating) {
  const lower = text.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((pattern) => pattern.test(lower))) {
      return rule;
    }
  }

  if (rating >= 4) {
    return {
      key: 'praise-default',
      label: 'Positive feedback',
      type: 'praise',
      suggestedAction: 'Keep the core flow stable and reinforce what users already like.',
    };
  }

  return {
    key: 'general-negative',
    label: 'General frustration',
    type: 'bug',
    suggestedAction:
      'Inspect the top complaint path and confirm whether it maps to a known bug or UX break.',
  };
}

function summarizeExamples(reviews) {
  return reviews
    .slice(0, 2)
    .map((review) => `${review.title || 'Review'}: ${review.body || review.text}`.trim())
    .join(' ');
}

function buildSeverityLabel(rating, count) {
  if (rating <= 2 || count >= 4) return 'High';
  if (rating === 3 || count >= 2) return 'Medium';
  return 'Low';
}

export function clusterReviews(reviews = []) {
  const map = new Map();

  for (const review of reviews) {
    const rule = pickRule(review.text || review.body || review.title || '', review.rating || 0);
    const cluster = map.get(rule.key) || {
      id: rule.key,
      label: rule.label,
      type: rule.type,
      reviewCount: 0,
      totalRating: 0,
      negativeCount: 0,
      positiveCount: 0,
      samples: [],
      suggestedAction: rule.suggestedAction,
    };

    cluster.reviewCount += 1;
    cluster.totalRating += Number(review.rating) || 0;
    cluster.negativeCount += review.rating <= 2 ? 1 : 0;
    cluster.positiveCount += review.rating >= 4 ? 1 : 0;
    cluster.samples.push(review);
    map.set(rule.key, cluster);
  }

  return Array.from(map.values())
    .map((cluster) => {
      const averageRating = cluster.reviewCount ? cluster.totalRating / cluster.reviewCount : 0;
      const sentiment =
        averageRating >= 4 ? 'positive' : averageRating <= 2.4 ? 'negative' : 'mixed';
      const highlight = summarizeExamples(cluster.samples);
      const share = reviews.length ? Math.round((cluster.reviewCount / reviews.length) * 100) : 0;

      return {
        ...cluster,
        averageRating,
        sentiment,
        highlight,
        share,
        severityLabel: buildSeverityLabel(averageRating, cluster.reviewCount),
        summary: `This cluster appears in ${cluster.reviewCount} reviews. ${highlight || 'Representative comments are short and repeat the same concern.'}`,
        examples: cluster.samples.slice(0, 3),
        topicKey: cluster.id,
      };
    })
    .sort((a, b) => {
      if (a.type === 'praise' && b.type !== 'praise') return 1;
      if (a.type !== 'praise' && b.type === 'praise') return -1;
      return b.reviewCount - a.reviewCount || a.averageRating - b.averageRating;
    });
}

export function splitClusters(clusters) {
  return {
    issueClusters: clusters.filter((cluster) => cluster.type !== 'praise'),
    praiseClusters: clusters.filter((cluster) => cluster.type === 'praise'),
  };
}
