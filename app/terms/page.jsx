export const metadata = {
  title: 'Terms of Service | Review Copilot',
};

export default function TermsPage() {
  return (
    <main className="shell shell--landing">
      <section className="legal-page">
        <div className="eyebrow">Legal</div>
        <h1>Terms of Service</h1>
        <div className="legal-page__content">
          <p>
            By using this website, you agree to use the service in a lawful and responsible manner.
          </p>
          <p>
            This tool is provided &quot;as is&quot; without any guarantees of continuous
            availability or accuracy. We reserve the right to modify, suspend, or discontinue any
            part of the service at any time without prior notice.
          </p>
          <p>Users are responsible for how they use the generated content and results.</p>
          <p>
            We are not liable for any indirect, incidental, or consequential damages arising from
            the use of this service.
          </p>
          <p>We reserve the right to refuse service to anyone at our discretion.</p>
        </div>
      </section>
    </main>
  );
}
