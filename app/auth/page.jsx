import Link from 'next/link';
import AuthForm from '../../components/auth-form.jsx';
import { getViewer } from '../../lib/user/viewer.js';

function asString(value) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

export default async function AuthPage({ searchParams }) {
  const viewer = await getViewer();
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {});
  const nextPath = asString(resolvedSearchParams.next) || '/';

  if (viewer.user) {
    return (
      <main className="shell shell--landing auth-shell">
        <section className="auth-card auth-card--signed-in">
          <div className="auth-card__intro">
            <div className="auth-card__home">
              <Link href="/" className="text-link">
                Back to home
              </Link>
            </div>
            <div className="eyebrow">Account Access</div>
            <h1 className="auth-card__title">You are already signed in.</h1>
            <p className="auth-card__lede">
              {viewer.planStatus === 'premium'
                ? 'Your Pro access is active. Open the analyzer or check pricing details.'
                : `You still have ${viewer.freeRemaining} free run${
                    viewer.freeRemaining === 1 ? '' : 's'
                  } left in this account.`}
            </p>
            <div className="auth-highlights" aria-label="Account details">
              <span>{viewer.email}</span>
              <span>{viewer.planStatus === 'premium' ? 'Plan: Pro' : 'Plan: Free'}</span>
              <span>
                {viewer.planStatus === 'premium'
                  ? 'Unlimited access'
                  : `${viewer.freeRemaining} free analyses remaining`}
              </span>
            </div>
          </div>

          <div className="auth-card__panel auth-card__panel--signed-in">
            <div className="signed-in-actions">
              <Link href="/#analyze" className="button button--primary">
                Open analyzer
              </Link>
              <Link href="/pricing" className="button button--ghost">
                View pricing
              </Link>
              <Link href={nextPath} className="button button--ghost">
                Back to previous page
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return <AuthForm />;
}
