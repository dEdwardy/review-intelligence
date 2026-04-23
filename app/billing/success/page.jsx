'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getProjectDisplayName } from '../../../lib/app-config.js';
import { getStoragePrefix } from '../../../lib/app-config.js';
import { getPaddleConfig } from '../../../lib/payments/paddle.js';

export default function BillingSuccessPage({ searchParams }) {
  const projectName = getProjectDisplayName();
  const { supportEmail } = getPaddleConfig();
  const storageKey = `${getStoragePrefix()}-receipt-email`;
  const [savedEmail] = useState(() =>
    typeof window === 'undefined' ? '' : (window.localStorage.getItem(storageKey) ?? '')
  );
  const queryEmail = typeof searchParams?.email === 'string' ? searchParams.email : '';
  const transactionId = typeof searchParams?.txn === 'string' ? searchParams.txn : '';
  const [status, setStatus] = useState(() => (transactionId ? 'checking' : 'pending'));
  const [statusMessage, setStatusMessage] = useState(() =>
    transactionId
      ? 'Checking payment status...'
      : 'Payment is still pending confirmation. Refresh this page after checkout completes.'
  );
  const displayEmail = queryEmail || savedEmail;

  useEffect(() => {
    if (!transactionId) return;

    let cancelled = false;

    fetch('/api/paddle/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transactionId, email: displayEmail }),
    })
      .then(async (response) => {
        const data = await response.json().catch(() => ({}));
        if (cancelled) return;

        if (!response.ok) {
          setStatus('error');
          setStatusMessage(data?.error || 'Unable to confirm payment yet.');
          return;
        }

        if (data?.status === 'completed') {
          if (displayEmail && typeof window !== 'undefined') {
            window.localStorage.setItem(storageKey, displayEmail);
          }
          setStatus('completed');
          setStatusMessage('Your one-time purchase has been confirmed and access is now unlocked.');
          return;
        }

        setStatus('pending');
        setStatusMessage('Payment is still being processed. Refresh this page in a moment.');
      })
      .catch(() => {
        if (cancelled) return;
        setStatus('error');
        setStatusMessage('Unable to confirm payment yet.');
      });

    return () => {
      cancelled = true;
    };
  }, [displayEmail, storageKey, transactionId]);

  return (
    <main className="shell shell--landing">
      <section className="pricing-card pricing-card--success">
        <div className="pricing-card__top">
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
        <div className="eyebrow">
          {status === 'completed' ? 'Payment confirmed' : 'Payment status'}
        </div>
        <h1>
          {status === 'completed'
            ? `${projectName} access unlocked.`
            : 'Checking your purchase status.'}
        </h1>
        <p className="pricing-card__lede">{statusMessage}</p>
        <div className="pricing-summary">
          <div>
            <div className="pricing-summary__label">Receipt email</div>
            <div className="pricing-summary__value">
              {displayEmail || 'We will remember it in this browser after checkout.'}
            </div>
          </div>
          <div>
            <div className="pricing-summary__label">Next step</div>
            <div className="pricing-summary__value">
              Run an analysis with a public App Store URL
            </div>
          </div>
          <div>
            <div className="pricing-summary__label">Support</div>
            <div className="pricing-summary__value">{supportEmail}</div>
          </div>
          <div>
            <div className="pricing-summary__label">Status</div>
            <div className="pricing-summary__value">
              {status === 'completed'
                ? 'Completed'
                : status === 'checking'
                  ? 'Checking'
                  : status === 'pending'
                    ? 'Pending'
                    : 'Needs attention'}
            </div>
          </div>
        </div>
        <div className="hero__links">
          <Link href="/" className="button button--primary">
            {status === 'completed' ? 'Start analysis' : 'Back home'}
          </Link>
          <Link href="/pricing" className="button button--ghost">
            View pricing
          </Link>
          {status !== 'completed' ? (
            <button
              className="button button--ghost"
              type="button"
              onClick={() => window.location.reload()}
            >
              Refresh status
            </button>
          ) : null}
        </div>
      </section>
    </main>
  );
}
