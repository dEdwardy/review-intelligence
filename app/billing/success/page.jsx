'use client';

import Link from 'next/link';
import { useState } from 'react';
import { getProjectDisplayName } from '../../../lib/app-config.js';
import { getStoragePrefix } from '../../../lib/app-config.js';

export default function BillingSuccessPage({ searchParams }) {
  const projectName = getProjectDisplayName();
  const storageKey = `${getStoragePrefix()}-receipt-email`;
  const [savedEmail] = useState(() =>
    typeof window === 'undefined' ? '' : (window.localStorage.getItem(storageKey) ?? '')
  );

  const queryEmail = typeof searchParams?.email === 'string' ? searchParams.email : '';
  const displayEmail = queryEmail || savedEmail;

  return (
    <main className="shell shell--landing">
      <section className="pricing-card pricing-card--success">
        <div className="pricing-card__top">
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
        <div className="eyebrow">Payment confirmed</div>
        <h1>{projectName} access unlocked.</h1>
        <p className="pricing-card__lede">
          Your purchase is linked to your account. You can now run analyses without the free limit.
        </p>
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
        </div>
        <div className="hero__links">
          <Link href="/" className="button button--primary">
            Start analysis
          </Link>
          <Link href="/pricing" className="button button--ghost">
            View pricing
          </Link>
        </div>
      </section>
    </main>
  );
}
