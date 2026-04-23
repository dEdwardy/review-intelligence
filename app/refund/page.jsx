import Link from 'next/link';
import { getPaddleConfig } from '../../lib/payments/paddle.js';

export const metadata = {
  title: 'Refund Policy | Review Copilot',
};

export default function RefundPage() {
  const { supportEmail } = getPaddleConfig();

  return (
    <main className="shell shell--landing">
      <section className="legal-page">
        <div className="legal-page__top">
          <Link href="/" className="text-link">
            Back to home
          </Link>
        </div>
        <div className="eyebrow">Legal</div>
        <h1>Refund Policy</h1>
        <div className="legal-page__content">
          <p>We offer a 7-day refund policy under limited conditions.</p>
          <p>
            Refunds are only granted if the product is not functioning as described or has
            significant technical issues that cannot be resolved.
          </p>
          <p>
            Refund requests are reviewed on a case-by-case basis and must include a clear
            explanation of the issue.
          </p>
          <p>We do not provide refunds for:</p>
          <ul className="legal-list">
            <li>Change of mind after purchase</li>
            <li>Misunderstanding of product features clearly described on the website</li>
            <li>Partial usage of the service</li>
          </ul>
          <p>
            To request a refund, please contact us at:{' '}
            <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
          </p>
          <p>We reserve the right to refuse refunds that do not meet the above criteria.</p>
        </div>
      </section>
    </main>
  );
}
