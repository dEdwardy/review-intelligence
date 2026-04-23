import Link from 'next/link';
import { getProjectDisplayName } from '../../lib/app-config.js';
import PaddleCheckoutButton from '../../components/paddle-checkout-button.jsx';
import SessionActions from '../../components/session-actions.jsx';
import {
  getPaddleConfig,
  hasPaddleJsCheckout,
  isPaddleCheckoutReady,
} from '../../lib/payments/paddle.js';
import { getViewer } from '../../lib/user/viewer.js';

const VALUE_POINTS = [
  {
    title: 'Launch price',
    body: 'A low-friction one-time purchase for early users validating the product.',
  },
  {
    title: 'Real App Store pages',
    body: 'Run public App Store links through the analyzer and export a report the same day.',
  },
  {
    title: 'Light receipt trail',
    body: 'Your email is stored locally for follow-up without creating an account.',
  },
];

export default async function PricingPage() {
  const projectName = getProjectDisplayName();
  const config = getPaddleConfig();
  const checkoutReady = isPaddleCheckoutReady();
  const paddleJsReady = hasPaddleJsCheckout();
  const viewer = await getViewer();

  return (
    <main className="shell shell--landing">
      <header className="masthead">
        <div className="brand-lockup">
          <span className="brand-lockup__mark" />
          <div>
            <div className="brand-lockup__name">{projectName}</div>
            <div className="brand-lockup__subhead">
              Early access pricing for App Store review analysis
            </div>
          </div>
        </div>
        <div className="masthead__links">
          <Link className="text-link" href="/">
            Home
          </Link>
          <Link className="text-link" href="/#analyze">
            Analyzer
          </Link>
        </div>
        <SessionActions userEmail={viewer.email} nextPath="/pricing" />
      </header>

      <section className="pricing-layout">
        <div className="pricing-hero">
          <div className="eyebrow">Early access</div>
          <h1>{config.productName}</h1>
          <p className="pricing-card__lede">
            A one-time early-access purchase for teams that want to turn public App Store reviews
            into a ranked fix list, reply drafts, and competitor gaps they can use right away.
          </p>

          <div className="pricing-card__price">
            <span className="pricing-card__amount">
              {config.currencySymbol + config.oneTimeAmount}
            </span>
            <span className="pricing-card__term">{config.purchaseLabel}</span>
          </div>
          <div className="pricing-card__subline">One-time payment. Instant access.</div>

          <div className="pricing-card__quota">
            {viewer.user ? (
              viewer.planStatus === 'premium' ? (
                <span>Pro access active</span>
              ) : (
                <span>
                  {viewer.freeRemaining} free run{viewer.freeRemaining === 1 ? '' : 's'} left
                </span>
              )
            ) : (
              <span>Sign up to get 3 free runs before upgrade</span>
            )}
          </div>

          <div className="pricing-hero__grid">
            {VALUE_POINTS.map((point) => (
              <article key={point.title} className="pricing-point">
                <h2>{point.title}</h2>
                <p>{point.body}</p>
              </article>
            ))}
          </div>

          <div className="pricing-note">
            Early access pricing is live at a one-time $9. Subscription plans are reserved for a
            later release.
          </div>
        </div>

        <aside className="pricing-card pricing-card--panel">
          <div className="pricing-card__top">
            <Link href="/" className="text-link">
              Back to home
            </Link>
          </div>
          <div className="eyebrow">Checkout</div>
          <div className="pricing-panel__shell">
            <div className="pricing-panel__status">
              <span className="pricing-panel__badge">
                {viewer.planStatus === 'premium' ? 'Active' : 'One-time'}
              </span>
              <h2>{viewer.planStatus === 'premium' ? 'Pro access active' : 'Unlock Pro - $9'}</h2>
              <p className="hint">
                {viewer.planStatus === 'premium'
                  ? 'This account already has Pro access. You can keep analyzing without using free runs.'
                  : 'Early access offer. One-time purchase now. Subscription plans coming later.'}
              </p>
            </div>
            {viewer.planStatus === 'premium' ? (
              <div className="pricing-panel__cta">
                <Link className="button button--primary button--compact" href="/#analyze">
                  Open analyzer
                </Link>
                <span className="pricing-panel__caption">
                  No checkout needed for this signed-in account.
                </span>
              </div>
            ) : (
              <PaddleCheckoutButton
                config={config}
                checkoutReady={checkoutReady}
                viewer={{
                  email: viewer.email,
                  userId: viewer.user?.id ?? '',
                }}
              />
            )}

            {!paddleJsReady && viewer.planStatus !== 'premium' ? (
              <div className="pricing-note">
                For reliable account linking, enable Paddle.js with{' '}
                <code>NEXT_PUBLIC_PADDLE_CLIENT_TOKEN</code>.
              </div>
            ) : null}
          </div>
        </aside>
      </section>
    </main>
  );
}
