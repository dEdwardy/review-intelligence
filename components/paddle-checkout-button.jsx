'use client';

import Script from 'next/script';
import Link from 'next/link';
import { useState } from 'react';

function ensurePaddleInitialized({ token }) {
  if (typeof window === 'undefined' || !window.Paddle || !token) return false;

  if (!window.__reviewIntelligencePaddleInitialized) {
    window.Paddle.Initialize({
      token,
      eventCallback(event) {
        if (event?.name !== 'checkout.completed') return;

        const transactionId = event?.data?.transaction_id ?? '';
        const customerEmail = event?.data?.customer?.email ?? '';
        const nextUrl = new URL('/billing/success', window.location.origin);
        if (transactionId) nextUrl.searchParams.set('txn', transactionId);
        if (customerEmail) nextUrl.searchParams.set('email', customerEmail);
        window.location.assign(nextUrl.toString());
      },
    });
    window.__reviewIntelligencePaddleInitialized = true;
  }

  return true;
}

export default function PaddleCheckoutButton({ config, viewer, checkoutReady }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function handleOpenCheckout() {
    if (!viewer?.userId) {
      window.location.assign('/auth?next=/pricing');
      return;
    }

    if (!config.clientToken) {
      setMessage('Paddle client token is missing. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN.');
      return;
    }

    if (!ensurePaddleInitialized({ token: config.clientToken })) {
      setMessage('Paddle.js is not available yet. Refresh and try again.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      window.Paddle.Checkout.open({
        items: [{ priceId: config.oneTimePriceId, quantity: 1 }],
        customer: {
          email: viewer.email,
        },
        customData: {
          supabase_user_id: viewer.userId,
          supabase_email: viewer.email,
          plan_key: 'review_intelligence_pro_one_time',
        },
        settings: {
          displayMode: 'overlay',
          theme: 'dark',
          locale: 'en',
          successUrl: `${window.location.origin}/billing/success`,
        },
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to open Paddle checkout.');
      setBusy(false);
      return;
    }

    window.setTimeout(() => setBusy(false), 1200);
  }

  return (
    <>
      {config.clientToken ? (
        <Script src="https://cdn.paddle.com/paddle/v2/paddle.js" strategy="afterInteractive" />
      ) : null}

      <div className="pricing-panel__cta">
        {config.clientToken ? (
          <button
            className="button button--primary button--compact"
            type="button"
            onClick={handleOpenCheckout}
            disabled={busy}
            aria-busy={busy}
          >
            {busy ? 'Opening checkout…' : 'Unlock Pro - $9'}
          </button>
        ) : checkoutReady ? (
          <a
            className="button button--primary button--compact"
            href={config.checkoutUrl}
            target="_blank"
            rel="noreferrer"
          >
            Unlock Pro - $9
          </a>
        ) : (
          <Link
            className="button button--ghost button--compact button--static"
            href="/auth?next=/pricing"
          >
            Sign in to unlock
          </Link>
        )}

        <span className="pricing-panel__caption">
          {config.clientToken
            ? 'One-time payment. Linked to the signed-in account.'
            : checkoutReady
              ? 'Hosted checkout is connected, but account linking is limited until Paddle.js is enabled.'
              : 'Checkout is not connected yet. Add NEXT_PUBLIC_PADDLE_CLIENT_TOKEN to enable linked checkout.'}
        </span>

        {message ? (
          <span className="pricing-panel__caption pricing-panel__caption--error">{message}</span>
        ) : null}
      </div>
    </>
  );
}
