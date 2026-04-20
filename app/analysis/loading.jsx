export default function Loading() {
  return (
    <main className="shell">
      <section className="dashboard">
        <div className="header-row" style={{ marginBottom: 18 }}>
          <div>
            <div className="eyebrow">Loading analysis</div>
            <p className="hint">
              Reading the App Store page and grouping the latest review themes.
            </p>
          </div>
        </div>
        <div className="skeleton-line skeleton-line--large" />
        <div className="skeleton-grid">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
        <div className="skeleton-stack">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </section>
    </main>
  );
}
