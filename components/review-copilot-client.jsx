'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
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
  const [presetBusy, setPresetBusy] = useState('');

  const competitors = useMemo(
    () => [competitor1, competitor2, competitor3].filter((item) => item.trim()),
    [competitor1, competitor2, competitor3]
  );

  function submit(event) {
    const normalizedAppUrl = appUrl.trim();
    if (!normalizedAppUrl) {
      if (event) {
        event.preventDefault();
      }
      setErrorMessage('Please enter a public App Store URL to continue.');
      return;
    }

    setErrorMessage('');
    setIsPending(true);
    setPendingLabel('Loading your analysis');
  }

  function loadPreset(preset) {
    setPresetBusy(preset.label);
    const params = new URLSearchParams({
      app: preset.app,
      competitors: preset.competitors.join(','),
      days: preset.days,
      ratings: preset.ratings,
      version: preset.version,
    });
    router.push(`/analysis?${params.toString()}`);
  }

  return (
    <form className="input-form" action="/analysis" method="get" onSubmit={submit} noValidate>
      <div className="input-form__head">
        <div className="eyebrow">Run an analysis</div>
        <h2>Paste one public App Store link and get the review story.</h2>
        <p className="hint">
          Start with one app. Add competitors only if you want a side-by-side read.
        </p>
        <p className="hint">
          Sign-in required. New accounts get <strong>3 free analyses</strong> before upgrade.
        </p>
      </div>

      <div className="preset-actions">
        {PRESETS.map((preset) => (
          <button
            key={preset.label}
            className="preset-button"
            type="button"
            disabled={Boolean(presetBusy)}
            aria-busy={presetBusy === preset.label}
            onClick={() => loadPreset(preset)}
          >
            {presetBusy === preset.label ? 'Loading…' : preset.label}
          </button>
        ))}
      </div>

      <div className="field">
        <label htmlFor="app-url">App Store URL</label>
        <input
          id="app-url"
          name="app"
          type="url"
          inputMode="url"
          autoComplete="off"
          value={appUrl}
          onChange={(event) => setAppUrl(event.target.value)}
          placeholder="https://apps.apple.com/us/app/your-app/id123456789..."
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
            name="competitor-1"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={competitor1}
            onChange={(event) => setCompetitor1(event.target.value)}
            placeholder="Optional competitor URL..."
          />
        </div>
        <div className="field">
          <label htmlFor="competitor-2">Competitor 2 optional</label>
          <input
            id="competitor-2"
            name="competitor-2"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={competitor2}
            onChange={(event) => setCompetitor2(event.target.value)}
            placeholder="Optional competitor URL..."
          />
        </div>
      </div>

      <input type="hidden" name="competitors" value={competitors.join(',')} />

      <div className="field-grid">
        <div className="field">
          <label htmlFor="competitor-3">Competitor 3 optional</label>
          <input
            id="competitor-3"
            name="competitor-3"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={competitor3}
            onChange={(event) => setCompetitor3(event.target.value)}
            placeholder="Optional competitor URL..."
          />
        </div>
      </div>

      <div className="field field--filters field--filters--full">
        <div className="field-grid field-grid--compact field-grid--filters">
          <div className="field">
            <label htmlFor="days">Window</label>
            <select
              id="days"
              name="days"
              value={days}
              onChange={(event) => setDays(event.target.value)}
            >
              <option value="30">30 days</option>
              <option value="90">90 days</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="ratings">Ratings</label>
            <select
              id="ratings"
              name="ratings"
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
              name="version"
              value={version}
              onChange={(event) => setVersion(event.target.value)}
            >
              <option value="all">Any version</option>
              <option value="current">Current version</option>
            </select>
          </div>
        </div>
      </div>

      <div className="actions" aria-busy={isPending}>
        <button className="button button--primary" type="submit" disabled={isPending}>
          {isPending ? 'Reading App Store reviews…' : 'Analyze Reviews'}
        </button>
        <Link className="button button--ghost" href="/auth?next=/analysis&mode=signup">
          Register (3 Free)
        </Link>
        <a className="button button--ghost" href="#workflow">
          View Outputs
        </a>
      </div>

      {isPending && pendingLabel ? (
        <div className="inline-status" role="status" aria-live="polite">
          {pendingLabel}. This usually takes a few seconds.
        </div>
      ) : null}
    </form>
  );
}
