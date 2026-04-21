'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getStoragePrefix } from '../lib/app-config.js';
import { getSupabaseBrowserClient } from '../lib/supabase/client.js';

const EMAIL_KEY = `${getStoragePrefix()}-receipt-email`;

export default function PayPalCheckout({ config, configured }) {
  const supabase = getSupabaseBrowserClient();
  const [signedInEmail, setSignedInEmail] = useState('');
  const [email, setEmail] = useState(() =>
    typeof window === 'undefined' ? '' : (window.localStorage.getItem(EMAIL_KEY) ?? '')
  );
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');

  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (cancelled) return;
      setSignedInEmail(data?.user?.email ?? '');
      if (!email && data?.user?.email) {
        setEmail(data.user.email);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, email]);

  useEffect(() => {
    if (!email) return;
    window.localStorage.setItem(EMAIL_KEY, email);
  }, [email]);

  async function handleCheckout() {
    if (!configured) {
      setMessage('Add PayPal credentials first.');
      return;
    }

    setBusy(true);
    setMessage('');

    try {
      const response = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: config.amount,
          currency: config.currency,
          returnUrl: config.returnUrl,
          cancelUrl: config.cancelUrl,
          productName: config.productName,
          email: email.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/auth?next=/pricing';
          return;
        }
        throw new Error(data.error || 'Unable to create PayPal order.');
      }

      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
        return;
      }

      throw new Error('PayPal approval URL was missing.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Payment failed.');
      setBusy(false);
    }
  }

  async function handleCopyEmail() {
    if (!email.trim()) return;
    setCopyStatus('Copying...');
    try {
      await navigator.clipboard.writeText(email.trim());
      setCopyStatus('Copied');
    } catch {
      setCopyStatus('Copy failed');
    }
    window.setTimeout(() => setCopyStatus(''), 1600);
  }

  return (
    <div className="paypal-box">
      <Script
        src={`https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(
          config.clientId || 'sb'
        )}&currency=${encodeURIComponent(config.currency)}&intent=capture`}
        strategy="afterInteractive"
      />

      <div className="field__hint paypal-box__account" style={{ marginBottom: 12 }}>
        {signedInEmail ? (
          <>
            Signed in as <strong>{signedInEmail}</strong>. This purchase upgrades this account.
          </>
        ) : (
          <>
            <Link className="text-link" href="/auth?next=/pricing&mode=signup">
              Register
            </Link>{' '}
            or{' '}
            <Link className="text-link" href="/auth?next=/pricing">
              sign in
            </Link>{' '}
            before checkout.
          </>
        )}
      </div>

      <div className="field">
        <label htmlFor="pay-email">Email for PayPal receipt (optional)</label>
        <input
          id="pay-email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          spellCheck={false}
          placeholder="you@company.com..."
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <div className="field__hint">
          We store this locally to prefill PayPal checkout on this device.
        </div>
      </div>

      <div className="auth-actions">
        <button
          className="button button--primary auth-actions__submit"
          type="button"
          onClick={handleCheckout}
          disabled={busy}
          aria-busy={busy}
        >
          {busy ? 'Opening PayPal...' : 'Pay with PayPal'}
        </button>
        <div className="auth-actions__secondary">
          <button
            className="button button--ghost"
            type="button"
            onClick={handleCopyEmail}
            disabled={!email.trim() || busy}
          >
            {copyStatus || 'Copy Receipt Email'}
          </button>
          <Link className="button button--ghost" href="/auth?next=/pricing">
            Update Account
          </Link>
        </div>
      </div>

      <div className="field__hint">
        {configured ? 'PayPal is ready.' : 'Checkout is inactive until credentials are set.'}
      </div>

      {message ? (
        <div className="form-error" role="alert">
          {message}
        </div>
      ) : null}
    </div>
  );
}
