'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getSupabaseBrowserClient } from '../lib/supabase/client.js';

export default function AuthForm() {
  const supabase = getSupabaseBrowserClient();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState(() =>
    searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  );
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const nextPath = searchParams.get('next') || '/';

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    setIsError(false);

    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`;
    const authRequest =
      mode === 'signin'
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });

    const { data, error } = await authRequest;
    setBusy(false);
    setIsError(Boolean(error));
    setMessage(
      error
        ? error.message
        : mode === 'signin'
          ? 'Signed in.'
          : 'Check your email to finish registration.'
    );

    if (!error && data?.session?.access_token && data?.session?.refresh_token) {
      await fetch('/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        }),
      });
    }

    if (!error && (mode === 'signin' || (mode === 'signup' && data?.session))) {
      setMessage('Redirecting…');
      window.location.href = nextPath;
    }
  }

  return (
    <main className="shell shell--landing auth-shell">
      <section className="auth-card">
        <div className="auth-card__intro">
          <div className="eyebrow">Account Access</div>
          <h1 className="auth-card__title">
            {mode === 'signin'
              ? 'Return to your review workspace.'
              : 'Create an account for 3 free runs.'}
          </h1>
          <p className="auth-card__lede">
            Sign in to run analyses, save quota usage, and unlock paid access after the free tier is
            exhausted.
          </p>
          <div className="auth-mode-switch" role="tablist" aria-label="Authentication mode">
            <button
              className={`auth-mode-switch__item ${mode === 'signin' ? 'auth-mode-switch__item--active' : ''}`}
              type="button"
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
            <button
              className={`auth-mode-switch__item ${mode === 'signup' ? 'auth-mode-switch__item--active' : ''}`}
              type="button"
              onClick={() => setMode('signup')}
            >
              Create Account
            </button>
          </div>
          <div className="auth-highlights" aria-label="Benefits">
            <span>3 free analyses per account</span>
            <span>Email confirmation required</span>
            <span>PayPal upgrade after quota ends</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              spellCheck={false}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={busy}
              placeholder="you@company.com..."
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={busy}
              placeholder={
                mode === 'signin' ? 'Enter your password...' : 'Use at least 6 characters...'
              }
              required
            />
          </div>

          <div className="auth-actions">
            <button
              className="button button--primary auth-actions__submit"
              type="submit"
              disabled={busy}
              aria-busy={busy}
            >
              {busy ? 'Working…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
            <div className="auth-actions__secondary">
              <button
                className="button button--ghost"
                type="button"
                disabled={busy}
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                Switch to {mode === 'signin' ? 'Sign Up' : 'Sign In'}
              </button>
              <Link href="/pricing" className="button button--ghost">
                View Pricing
              </Link>
            </div>
          </div>
        </form>

        {message ? (
          <div className="inline-status" role={isError ? 'alert' : 'status'} aria-live="polite">
            {message}
          </div>
        ) : null}

        <div className="auth-footer-link">
          <Link href={nextPath} className="text-link">
            Back to previous page
          </Link>
        </div>
      </section>
    </main>
  );
}
