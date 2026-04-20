'use client';

import { useMemo, useState } from 'react';
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

  const competitors = useMemo(
    () => [competitor1, competitor2, competitor3].filter((item) => item.trim()),
    [competitor1, competitor2, competitor3]
  );

  function goToAnalysis(params) {
    setIsPending(true);
    router.push(`/analysis?${params.toString()}`);
  }

  function submit(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    params.set('app', appUrl.trim());
    if (competitors.length) {
      params.set('competitors', competitors.join(','));
    }
    params.set('days', days);
    params.set('ratings', ratings);
    params.set('version', version);
    goToAnalysis(params);
  }

  function applyPreset(index) {
    const preset = PRESETS[index];
    const params = new URLSearchParams();
    params.set('app', preset.app);
    params.set('competitors', preset.competitors.join(','));
    params.set('days', preset.days);
    params.set('ratings', preset.ratings);
    params.set('version', preset.version);
    goToAnalysis(params);
  }

  return (
    <form className="input-form" onSubmit={submit}>
      <div className="input-form__head">
        <div className="eyebrow">Run an analysis</div>
        <h2>Input one app, add competitors if they matter.</h2>
        <p className="hint">
          Paste any public App Store product page to inspect recent reviews, recurring complaints,
          and competitor gaps.
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
        <label htmlFor="app-url">Your app URL</label>
        <input
          id="app-url"
          type="url"
          value={appUrl}
          onChange={(event) => setAppUrl(event.target.value)}
          placeholder="https://apps.apple.com/us/app/your-app/id123456789"
          required
        />
      </div>

      <div className="field-grid">
        <div className="field">
          <label htmlFor="competitor-1">Competitor 1</label>
          <input
            id="competitor-1"
            type="url"
            value={competitor1}
            onChange={(event) => setCompetitor1(event.target.value)}
            placeholder="Optional competitor URL"
          />
        </div>
        <div className="field">
          <label htmlFor="competitor-2">Competitor 2</label>
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
          <label htmlFor="competitor-3">Competitor 3</label>
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

      <div className="actions">
        <button className="button button--primary" type="submit" disabled={isPending}>
          {isPending ? 'Opening analysis...' : 'Analyze reviews'}
        </button>
        <a className="button button--ghost" href="#workflow">
          View outputs
        </a>
      </div>
    </form>
  );
}
