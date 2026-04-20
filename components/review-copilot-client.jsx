'use client';

import { useMemo, useState, useTransition } from 'react';

const REFERENCE_URLS = [
  'https://apps.apple.com/us/app/slack-business-communication/id618783545',
  'https://apps.apple.com/us/app/notion-notes-docs-tasks/id1232780281',
];

const PRESETS = [
  {
    label: 'Load Slack vs Notion',
    app: REFERENCE_URLS[0],
    competitors: [REFERENCE_URLS[1]],
    days: '30',
    ratings: 'all',
    version: 'all',
  },
  {
    label: 'Todoist vs Things',
    app: 'https://apps.apple.com/us/app/todoist-to-do-list-calendar/id572688855',
    competitors: ['https://apps.apple.com/us/app/things-3/id904280696'],
    days: '90',
    ratings: '1,2',
    version: 'all',
  },
];

export default function ReviewCopilotClient() {
  const [appUrl, setAppUrl] = useState('');
  const [competitor1, setCompetitor1] = useState('');
  const [competitor2, setCompetitor2] = useState('');
  const [competitor3, setCompetitor3] = useState('');
  const [days, setDays] = useState('30');
  const [ratings, setRatings] = useState('all');
  const [version, setVersion] = useState('all');
  const [isPending, setIsPending] = useState(false);
  const [pendingLabel, setPendingLabel] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isNavigating, startTransition] = useTransition();

  const competitors = useMemo(
    () => [competitor1, competitor2, competitor3].filter((item) => item.trim()),
    [competitor1, competitor2, competitor3]
  );

  function goToAnalysis(params, label) {
    setErrorMessage('');
    setIsPending(true);
    setPendingLabel(label);
    startTransition(() => {
      window.location.assign(`/analysis?${params.toString()}`);
    });
  }

  function submit(event) {
    if (event) {
      event.preventDefault();
    }
    const normalizedAppUrl = appUrl.trim();
    if (!normalizedAppUrl) {
      setErrorMessage('Please enter a public App Store URL to continue.');
      return;
    }

    const params = new URLSearchParams();
    params.set('app', normalizedAppUrl);
    if (competitors.length) {
      params.set('competitors', competitors.join(','));
    }
    params.set('days', days);
    params.set('ratings', ratings);
    params.set('version', version);
    goToAnalysis(params, 'Loading your analysis');
  }

  function applyPreset(index) {
    const preset = PRESETS[index];
    const params = new URLSearchParams();
    params.set('app', preset.app);
    params.set('competitors', preset.competitors.join(','));
    params.set('days', preset.days);
    params.set('ratings', preset.ratings);
    params.set('version', preset.version);
    goToAnalysis(params, `Loading ${preset.label}`);
  }

  return (
    <div className="input-form">
      <div className="input-form__head">
        <div className="eyebrow">Run an analysis</div>
        <h2>Paste one public App Store link and get the review story.</h2>
        <p className="hint">
          Start with one app. Add competitors only if you want a side-by-side read.
        </p>
      </div>

      <div className="preset-actions">
        {PRESETS.map((preset, index) => (
          <button
            key={preset.label}
            type="button"
            className="preset-button"
            onClick={() => applyPreset(index)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="field">
        <label htmlFor="app-url">App Store URL</label>
        <input
          id="app-url"
          type="url"
          value={appUrl}
          onChange={(event) => setAppUrl(event.target.value)}
          placeholder="https://apps.apple.com/us/app/your-app/id123456789"
          required
        />
        <div className="field__hint">
          Use any public App Store product page. No Apple developer account is needed.
        </div>
      </div>

      {errorMessage ? (
        <div className="form-error" role="alert">
          {errorMessage}
        </div>
      ) : null}

      <div className="field-grid">
        <div className="field">
          <label htmlFor="competitor-1">Competitor 1 optional</label>
          <input
            id="competitor-1"
            type="url"
            value={competitor1}
            onChange={(event) => setCompetitor1(event.target.value)}
            placeholder="Optional competitor URL"
          />
        </div>
        <div className="field">
          <label htmlFor="competitor-2">Competitor 2 optional</label>
          <input
            id="competitor-2"
            type="url"
            value={competitor2}
            onChange={(event) => setCompetitor2(event.target.value)}
            placeholder="Optional competitor URL"
          />
        </div>
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="competitor-3">Competitor 3 optional</label>
          <input
            id="competitor-3"
            type="url"
            value={competitor3}
            onChange={(event) => setCompetitor3(event.target.value)}
            placeholder="Optional competitor URL"
          />
        </div>
        <div className="field-grid field-grid--compact">
          <div className="field">
            <label htmlFor="days">Window</label>
            <select id="days" value={days} onChange={(event) => setDays(event.target.value)}>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="ratings">Ratings</label>
            <select
              id="ratings"
              value={ratings}
              onChange={(event) => setRatings(event.target.value)}
            >
              <option value="all">All reviews</option>
              <option value="1,2">1-2 stars</option>
              <option value="3">3 stars</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="version">Version</label>
            <select
              id="version"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            >
              <option value="all">Any version</option>
              <option value="current">Current version</option>
            </select>
          </div>
        </div>
      </div>

      <div className="actions" aria-busy={isPending || isNavigating}>
        <button
          className="button button--primary"
          type="button"
          onClick={submit}
          disabled={isPending || isNavigating}
        >
          {isPending || isNavigating ? 'Reading App Store reviews...' : 'Analyze reviews'}
        </button>
        <a className="button button--ghost" href="#workflow">
          View outputs
        </a>
      </div>

      {(isPending || isNavigating) && pendingLabel ? (
        <div className="inline-status" role="status" aria-live="polite">
          {pendingLabel}. This usually takes a few seconds.
        </div>
      ) : null}
    </div>
  );
}
