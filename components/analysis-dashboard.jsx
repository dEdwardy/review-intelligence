'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { buildMarkdownReport } from '../lib/export/markdown.js';
import { buildCsvReport } from '../lib/export/csv.js';
import { getStoragePrefix } from '../lib/app-config.js';

function downloadText(filename, content, type = 'text/plain;charset=utf-8') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyText(content) {
  await navigator.clipboard.writeText(content);
}

const TABS = [
  ['overview', 'Overview'],
  ['issues', 'Issues'],
  ['competitors', 'Competitors'],
  ['export', 'Export'],
];

export default function AnalysisDashboard({ analysis, viewer }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [busyAction, setBusyAction] = useState('');

  const markdown = useMemo(() => buildMarkdownReport(analysis), [analysis]);
  const csv = useMemo(() => buildCsvReport(analysis), [analysis]);

  const stats = analysis.overview.metrics;
  const hasCompetitors = analysis.competitors.length > 0;
  const hasIssueClusters = analysis.issueClusters.length > 0;
  const hasPraiseClusters = analysis.praiseClusters.length > 0;

  async function handleCopy(content, label) {
    setBusyAction(label);
    try {
      await copyText(content);
    } finally {
      window.setTimeout(() => setBusyAction(''), 900);
    }
  }

  async function handleDownload(filename, content, type, label) {
    setBusyAction(label);
    try {
      downloadText(filename, content, type);
    } finally {
      window.setTimeout(() => setBusyAction(''), 900);
    }
  }

  return (
    <main className="shell shell--analysis">
      <section className="dashboard">
        <div className="dashboard__top">
          <div>
            <div className="eyebrow">Analysis</div>
            <h1>{analysis.primaryApp.name}</h1>
            <p className="dashboard__summary">{analysis.overview.headline}</p>
          </div>
          <div className="dashboard__home">
            <Link className="text-link" href="/">
              Back to home
            </Link>
          </div>
          <div className="dashboard__filters">
            <span>{analysis.mode}</span>
            <span>{analysis.timeRangeDays} day window</span>
            <span>{analysis.ratingFilterLabel}</span>
            <span>{analysis.versionFilterLabel}</span>
            {viewer?.email ? <span>Signed in: {viewer.email}</span> : null}
            {viewer?.planStatus === 'premium' ? (
              <span>Plan: Pro</span>
            ) : viewer ? (
              <span>Free left: {Number(viewer.freeRemaining) || 0}</span>
            ) : null}
            {viewer?.planStatus === 'premium' ? null : (
              <a className="text-link" href="/pricing?upgrade=1">
                Upgrade
              </a>
            )}
          </div>
        </div>

        <div className="metrics">
          <div className="metric">
            <div className="metric__label">Reviews analyzed</div>
            <strong className="metric__value">{stats.totalReviews}</strong>
            <div className="metric__note">Primary app and competitor set combined</div>
          </div>
          <div className="metric">
            <div className="metric__label">Average rating</div>
            <strong className="metric__value">
              {stats.averageRating.toFixed(1)} <small>/ 5</small>
            </strong>
            <div className="metric__note">
              {stats.lowRatingCount} low ratings in this review set
            </div>
          </div>
          <div className="metric">
            <div className="metric__label">Largest complaint</div>
            <strong className="metric__value">{stats.topNegativeLabel}</strong>
            <div className="metric__note">{stats.topNegativeCount} reviews in the top cluster</div>
          </div>
          <div className="metric">
            <div className="metric__label">Recommended next move</div>
            <strong className="metric__value">{stats.nextActionLabel}</strong>
            <div className="metric__note">
              Use this as the starting point for the next release note or bug triage.
            </div>
          </div>
        </div>

        <div className="tabbar" role="tablist" aria-label="Analysis tabs">
          {TABS.map(([value, label]) => (
            <button
              key={value}
              className={`tabbar__item ${activeTab === value ? 'tabbar__item--active' : ''}`}
              type="button"
              onClick={() => setActiveTab(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' ? (
          <div className="dashboard__grid">
            <section className="panel">
              <div className="header-row">
                <h2>Top issues</h2>
                <span className="panel__meta">{analysis.issueClusters.length} clusters</span>
              </div>
              {!hasIssueClusters ? (
                <div className="empty-state empty-state--compact">
                  <h2>No issue clusters yet</h2>
                  <p>
                    This run does not contain enough repeated complaint language to form a stable
                    pattern yet. Try a wider window or a broader rating filter.
                  </p>
                </div>
              ) : (
                <div className="cluster-list">
                  {analysis.issueClusters.map((cluster) => (
                    <article key={cluster.id} className="cluster">
                      <div className="cluster__head">
                        <div>
                          <div className="cluster__title">{cluster.label}</div>
                          <div className="cluster__meta">
                            {cluster.type} - {cluster.reviewCount} reviews - {cluster.share}% share
                          </div>
                        </div>
                        <span className="status-pill">{cluster.severityLabel}</span>
                      </div>
                      <div className="cluster__body">{cluster.summary}</div>
                      <div className="cluster__action">{cluster.suggestedAction}</div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="panel panel--stacked">
              <article className="panel panel--subtle">
                <h3>Positive signal</h3>
                {!hasPraiseClusters ? (
                  <div className="empty-state empty-state--compact">
                    <h2>No positive cluster</h2>
                    <p>
                      The current filter is complaint-heavy, which is normal for low-rating review
                      slices.
                    </p>
                  </div>
                ) : (
                  <div className="review-list">
                    {analysis.praiseClusters.map((cluster) => (
                      <div key={cluster.id} className="cluster cluster--compact">
                        <div className="cluster__title">{cluster.label}</div>
                        <div className="cluster__meta">{cluster.reviewCount} reviews</div>
                        <div className="cluster__body">{cluster.summary}</div>
                      </div>
                    ))}
                  </div>
                )}
              </article>

              <article className="panel panel--subtle">
                <h3>Weekly summary</h3>
                <p>{analysis.weeklySummary}</p>
              </article>
            </section>
          </div>
        ) : null}

        {activeTab === 'issues' ? (
          <section className="panel">
            <h2>Issue detail</h2>
            {!hasIssueClusters ? (
              <div className="empty-state">
                <h2>No issue detail to show</h2>
                <p>
                  The current filters did not leave enough repeated review text to show detailed
                  issue groupings.
                </p>
              </div>
            ) : (
              <div className="cluster-list">
                {analysis.issueClusters.map((cluster) => (
                  <article key={cluster.id} className="cluster cluster--detail">
                    <div className="cluster__head">
                      <div>
                        <div className="cluster__title">{cluster.label}</div>
                        <div className="cluster__meta">{cluster.highlight}</div>
                      </div>
                      <span className="status-pill">{cluster.sentiment}</span>
                    </div>

                    <div className="cluster__body">{cluster.summary}</div>

                    <div className="review-list review-list--nested">
                      {cluster.examples.map((review) => (
                        <article key={review.id} className="review-row">
                          <div className="review-row__top">
                            <div>
                              <div className="cluster__title">{review.title}</div>
                              <div className="review__meta">
                                {review.author} - {review.rating} stars - {review.createdAt}
                              </div>
                            </div>
                            <span className="panel__meta">{review.source}</span>
                          </div>
                          <div className="review__body">{review.body}</div>
                        </article>
                      ))}
                    </div>

                    <div className="draft draft--inline">
                      <div className="draft__title">Reply draft</div>
                      <div className="draft__body">{cluster.replyDraft}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'competitors' ? (
          <section className="panel">
            <div className="header-row">
              <h2>Competitor gap</h2>
              <span className="panel__meta">
                {hasCompetitors
                  ? `${analysis.competitors.length} competitors`
                  : 'No competitors added'}
              </span>
            </div>

            {hasCompetitors ? (
              <div className="gap-list">
                {analysis.competitorGap.map((item) => (
                  <article key={item.id} className="gap-item">
                    <div className="gap-item__head">
                      <div>
                        <div className="gap-item__title">{item.label}</div>
                        <div className="gap-item__meta">
                          {item.competitorName} - {item.competitorCount} reviews
                        </div>
                      </div>
                      <span className="status-pill">{item.statusLabel}</span>
                    </div>
                    <div className="gap-item__body">{item.summary}</div>
                    <div className="cluster__action">{item.action}</div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <h2>Add one or more competitor links</h2>
                <p>
                  Competitor gap analysis works best with one to three comparison apps. The rest of
                  the run still works without them.
                </p>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === 'export' ? (
          <section className="panel">
            <h2>Export</h2>
            <p className="hint">
              Copy the report directly into a weekly note, release planning doc, or support
              workflow.
            </p>

            <div className="preview-output">
              <div className="preview-output__label">Summary preview</div>
              <div className="preview-output__body">{analysis.overview.headline}</div>
            </div>

            <div className="export-actions">
              <button
                className="button button--primary"
                type="button"
                disabled={Boolean(busyAction)}
                aria-busy={busyAction === 'Copy Markdown'}
                onClick={() => handleCopy(markdown, 'Copy Markdown')}
              >
                {busyAction === 'Copy Markdown' ? 'Copying…' : 'Copy Markdown'}
              </button>
              <button
                className="button button--ghost"
                type="button"
                disabled={Boolean(busyAction)}
                aria-busy={busyAction === 'Download Markdown'}
                onClick={() =>
                  handleDownload(
                    `${getStoragePrefix()}-report.md`,
                    markdown,
                    'text/plain;charset=utf-8',
                    'Download Markdown'
                  )
                }
              >
                {busyAction === 'Download Markdown' ? 'Downloading…' : 'Download Markdown'}
              </button>
              <button
                className="button button--ghost"
                type="button"
                disabled={Boolean(busyAction)}
                aria-busy={busyAction === 'Download CSV'}
                onClick={() =>
                  handleDownload(
                    `${getStoragePrefix()}-report.csv`,
                    csv,
                    'text/csv;charset=utf-8',
                    'Download CSV'
                  )
                }
              >
                {busyAction === 'Download CSV' ? 'Downloading…' : 'Download CSV'}
              </button>
              <button
                className="button button--ghost"
                type="button"
                disabled={Boolean(busyAction)}
                aria-busy={busyAction === 'Copy Weekly Summary'}
                onClick={() => handleCopy(analysis.weeklySummary, 'Copy Weekly Summary')}
              >
                {busyAction === 'Copy Weekly Summary' ? 'Copying…' : 'Copy Weekly Summary'}
              </button>
            </div>

            <div className="draft draft--inline" style={{ marginTop: 18 }}>
              <div className="draft__title">Weekly summary preview</div>
              <div className="draft__body">{analysis.weeklySummary}</div>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
