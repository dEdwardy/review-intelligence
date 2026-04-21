import Link from 'next/link';

export default function BillingCancelPage() {
  return (
    <main className="shell shell--landing">
      <section className="pricing-card pricing-card--success">
        <div className="pricing-card__top">
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
        <div className="eyebrow">Checkout paused</div>
        <h1>No charge was made.</h1>
        <p className="pricing-card__lede">You can go back and try again whenever you are ready.</p>
        <div className="hero__links">
          <Link href="/pricing" className="button button--primary">
            Try checkout again
          </Link>
          <Link href="/" className="button button--ghost">
            Back home
          </Link>
        </div>
      </section>
    </main>
  );
}
