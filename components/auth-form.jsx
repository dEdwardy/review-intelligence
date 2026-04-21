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
    <main className="shell shell--landing">
      <section className="pricing-card pricing-card--success">
        <div className="eyebrow">Account</div>
        <h1>{mode === 'signin' ? 'Sign in to continue.' : 'Create your account.'}</h1>
        <p className="pricing-card__lede">
          Login is required to run analyses. New accounts start with 3 free runs. After that, you
          will be asked to upgrade.
        </p>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={busy}
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
              {busy ? 'Working…' : mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <div className="auth-actions__secondary">
              <button
                className="button button--ghost"
                type="button"
                disabled={busy}
                onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
              >
                Switch to {mode === 'signin' ? 'sign up' : 'sign in'}
              </button>
              <Link href="/pricing" className="button button--ghost">
                View pricing
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
