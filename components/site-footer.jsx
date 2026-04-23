import Link from 'next/link';
import { getPaddleConfig } from '../lib/payments/paddle.js';

export default function SiteFooter() {
  const { supportEmail } = getPaddleConfig();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__links" aria-label="Legal">
          <Link href="/">Home</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/refund">Refund</Link>
        </div>
        <div className="site-footer__meta">
          Support: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
        </div>
      </div>
    </footer>
  );
}
