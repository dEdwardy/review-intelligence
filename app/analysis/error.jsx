'use client';

import Link from 'next/link';

export default function AnalysisError({ error, reset }) {
  return (
    <main className="shell">
      <section className="dashboard">
        <div className="empty-state">
          <div className="eyebrow">Analysis error</div>
          <h2>We could not load this run.</h2>
          <p>
            {error?.message ||
              'The App Store page could not be read right now. Check the URL and try again.'}
          </p>
          <p className="hint">
            If the page was just updated or the public feed is slow, retrying in a few moments
            usually helps.
          </p>
          <div className="actions">
            <button className="button button--primary" type="button" onClick={reset}>
              Try again
            </button>
            <Link className="button button--ghost" href="/">
              Back to input
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
