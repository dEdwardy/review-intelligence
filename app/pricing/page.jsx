import Link from 'next/link';
import { getProjectDisplayName } from '../../lib/app-config.js';
import SessionActions from '../../components/session-actions.jsx';
import { getPayPalConfig } from '../../lib/payments/paypal.js';
import { getSupabaseServerClient } from '../../lib/supabase/server.js';

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
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.auth.getUser();

  return (
    <main className="shell shell--landing">
      <header className="masthead">
        <div className="brand-lockup">
          <span className="brand-lockup__mark" />
          <div>
            <div className="brand-lockup__name">{projectName}</div>
            <div className="brand-lockup__subhead">
              Launch pricing for App Store review analysis
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
        <SessionActions userEmail={data?.user?.email ?? ''} nextPath="/pricing" />
      </header>

      <section className="pricing-layout">
        <div className="pricing-hero">
          <div className="eyebrow">Launch price</div>
          <h1>{config.productName}</h1>
          <p className="pricing-card__lede">
            An early-access one-time purchase for teams that want to inspect public App Store
            reviews, identify recurring issues, and leave with a report they can use right away.
          </p>

          <div className="pricing-card__price">
            <span className="pricing-card__amount">
              {config.currency} {config.amount}
            </span>
            <span className="pricing-card__term">launch price, one-time purchase</span>
          </div>

          <div className="pricing-hero__grid">
            {VALUE_POINTS.map((point) => (
              <article key={point.title} className="pricing-point">
                <h2>{point.title}</h2>
                <p>{point.body}</p>
              </article>
            ))}
          </div>
        </div>

        <aside className="pricing-card pricing-card--panel">
          <div className="pricing-card__top">
            <Link href="/" className="text-link">
              Back to home
            </Link>
          </div>
          <div className="eyebrow">Checkout</div>
          <h2>Unlock Pro</h2>
          <p className="hint">Payments coming soon.</p>
          <button className="button button--primary" type="button" disabled>
            Unlock Pro
          </button>
          <div className="pricing-note">Upgrade to Pro (coming soon).</div>
        </aside>
      </section>
    </main>
  );
}
