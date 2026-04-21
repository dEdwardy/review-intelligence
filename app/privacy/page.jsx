export const metadata = {
  title: 'Privacy Policy | Review Copilot',
};

export default function PrivacyPage() {
  return (
    <main className="shell shell--landing">
      <section className="legal-page">
        <div className="eyebrow">Legal</div>
        <h1>Privacy Policy</h1>
        <div className="legal-page__content">
          <p>We respect your privacy.</p>
          <p>
            We do not sell or share your personal data with third parties, except as necessary to
            operate and improve the service.
          </p>
          <p>
            We may collect limited usage data (such as interactions and analytics) to improve
            product performance and user experience.
          </p>
          <p>
            We implement reasonable measures to protect your data, but we cannot guarantee absolute
            security.
          </p>
          <p>By using this website, you agree to this privacy policy.</p>
        </div>
      </section>
    </main>
  );
}
