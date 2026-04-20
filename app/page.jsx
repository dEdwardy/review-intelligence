import Link from 'next/link';
import ReviewCopilotClient from '../components/review-copilot-client.jsx';

const REFERENCE_LINKS = [
  {
    label: 'Slack vs Notion',
    href: '/analysis?app=https%3A%2F%2Fapps.apple.com%2Fus%2Fapp%2Fslack-business-communication%2Fid618783545&competitors=https%3A%2F%2Fapps.apple.com%2Fus%2Fapp%2Fnotion-notes-docs-tasks%2Fid1232780281&days=30&ratings=all&version=all',
  },
  {
    label: 'Todoist vs Things',
    href: '/analysis?app=https%3A%2F%2Fapps.apple.com%2Fus%2Fapp%2Ftodoist-to-do-list-calendar%2Fid572688855&competitors=https%3A%2F%2Fapps.apple.com%2Fus%2Fapp%2Fthings-3%2Fid904280696&days=90&ratings=1%2C2&version=all',
  },
];

export default function HomePage() {
  return (
    <main className="shell shell--landing">
      <header className="masthead">
        <div className="brand-lockup">
          <span className="brand-lockup__mark" />
          <div>
            <div className="brand-lockup__name">Review Copilot</div>
            <div className="brand-lockup__subhead">
              App Store review intelligence for indie teams
            </div>
          </div>
        </div>
        <div className="masthead__note">Apple App Store only</div>
      </header>

      <section className="hero">
        <div className="hero__copy">
          <div className="eyebrow">Review backlog, ordered</div>
          <h1>See the complaint pattern before the next release slips.</h1>
          <p>
            Paste your App Store URL, pull recent reviews, compare competitor complaints, and leave
            with a ranked fix list, reply drafts, and a summary you can drop into planning.
          </p>

          <div className="hero__meta">
            <span>One app, up to three competitors</span>
            <span>30 or 90 day windows</span>
            <span>Markdown and CSV exports</span>
          </div>

          <div className="hero__facts">
            <div>
              <strong>Find repeated pain fast</strong>
              <span>
                Clusters reviews into bug, UX, pricing, performance, support, and request themes.
              </span>
            </div>
            <div>
              <strong>Compare without a full ASO stack</strong>
              <span>
                Shows which complaints are hurting competitors before they become your problem.
              </span>
            </div>
            <div>
              <strong>Export what the team actually needs</strong>
              <span>Reply drafts, weekly notes, and issue summaries you can reuse right away.</span>
            </div>
          </div>

          <div className="hero__links">
            <Link href="#analyze" className="button button--primary">
              Open analyzer
            </Link>
            <Link href="#workflow" className="button button--ghost">
              See the flow
            </Link>
          </div>

          <div className="example-strip">
            <span className="example-strip__label">Reference app pairs</span>
            <div className="inline-list">
              {REFERENCE_LINKS.map((entry) => (
                <Link key={entry.label} className="text-link" href={entry.href}>
                  {entry.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="hero__aside" id="analyze">
          <ReviewCopilotClient />
        </div>
      </section>

      <section className="workflow" id="workflow">
        <div className="section-heading">
          <span className="section-heading__kicker">What the run returns</span>
          <h2>Built for shipping decisions, not dashboards.</h2>
        </div>

        <div className="workflow__stack">
          <article className="workflow__row">
            <div className="workflow__index">01</div>
            <div className="workflow__content">
              <h3>Pull and normalize the review stream</h3>
              <p>
                App metadata, recent reviews, rating filters, version filters, and a consistent text
                shape.
              </p>
            </div>
          </article>
          <article className="workflow__row">
            <div className="workflow__index">02</div>
            <div className="workflow__content">
              <h3>Group the repeated complaints</h3>
              <p>
                Highlights top issues, pressure points, and positive signals without hiding the
                underlying text.
              </p>
            </div>
          </article>
          <article className="workflow__row">
            <div className="workflow__index">03</div>
            <div className="workflow__content">
              <h3>Leave with usable output</h3>
              <p>
                Reply drafts, competitor gaps, Markdown export, CSV export, and a weekly planning
                summary.
              </p>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
