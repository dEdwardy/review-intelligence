import Link from 'next/link';
import ReviewCopilotClient from '../components/review-copilot-client.jsx';
import SessionActions from '../components/session-actions.jsx';
import { getProjectDisplayName } from '../lib/app-config.js';
import { getViewer } from '../lib/user/viewer.js';

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

export default async function HomePage() {
  const viewer = await getViewer();
  const projectName = getProjectDisplayName();
  const isSignedIn = Boolean(viewer.user);

  return (
    <main className="shell shell--landing">
      <header className="masthead">
        <div className="brand-lockup">
          <span className="brand-lockup__mark" />
          <div>
            <div className="brand-lockup__name">{projectName}</div>
            <div className="brand-lockup__subhead">
              App Store review intelligence for indie teams
            </div>
          </div>
        </div>
        <div className="masthead__note">Apple App Store only</div>
        <SessionActions userEmail={viewer.email} nextPath="/" />
      </header>

      <section className="hero">
        <div className="hero__copy">
          <div className="eyebrow">Review signal, not noise</div>
          <h1>Turn App Store reviews into shipping decisions.</h1>
          <p>
            Paste one public App Store URL and get a ranked fix list, reply drafts, competitor gaps,
            and a summary you can drop into planning.
          </p>

          <div className="hero__meta">
            <span>One app, up to three competitors</span>
            <span>30 or 90 day windows</span>
            <span>Markdown and CSV exports</span>
          </div>
          <div className="hero__quota">
            {viewer.user ? (
              <span>
                {viewer.planStatus === 'premium'
                  ? 'Pro access active'
                  : `${viewer.freeRemaining} free run${viewer.freeRemaining === 1 ? '' : 's'} left`}
              </span>
            ) : (
              <span>Sign up to get 3 free runs</span>
            )}
          </div>

          <div className="hero__proof">
            <span>
              {viewer.planStatus === 'premium' ? 'Pro access active' : '3 free runs after sign-up'}
            </span>
            <span>Exports in Markdown &amp; CSV</span>
            <span>Compare up to 3 competitors</span>
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
            <Link href="/pricing" className="button button--ghost">
              View pricing
            </Link>
            {!isSignedIn ? (
              <Link href="/auth?next=/" className="button button--ghost">
                Get 3 free runs
              </Link>
            ) : null}
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
          <ReviewCopilotClient
            viewer={{
              email: viewer.email,
              planStatus: viewer.planStatus,
              freeRemaining: viewer.freeRemaining,
            }}
          />
        </div>
      </section>

      <section className="sample-panel">
        <div className="section-heading">
          <span className="section-heading__kicker">Sample output</span>
          <h2>See the kind of answer the tool gives before you spend a run.</h2>
        </div>
        <div className="sample-panel__grid">
          <article className="sample-card">
            <div className="sample-card__label">Top issue</div>
            <h3>Slow sync and missing updates</h3>
            <p>
              Reviews point to users waiting on state changes and not trusting whether the last
              action saved.
            </p>
          </article>
          <article className="sample-card">
            <div className="sample-card__label">Reply draft</div>
            <h3>One response you can reuse</h3>
            <p>
              A short support reply that acknowledges the issue, asks for the minimum useful
              details, and keeps the thread moving.
            </p>
          </article>
          <article className="sample-card">
            <div className="sample-card__label">Competitor gap</div>
            <h3>Pricing complaints show up earlier elsewhere</h3>
            <p>
              Compare a rival and see where the same issue is already surfacing so you can catch it
              before it becomes your own pattern.
            </p>
          </article>
        </div>
      </section>

      <section className="proof-panel">
        <div className="section-heading">
          <span className="section-heading__kicker">Why teams keep it open</span>
          <h2>It turns scattered reviews into decisions people can act on.</h2>
        </div>
        <div className="proof-panel__grid">
          <article className="proof-panel__item">
            <div className="proof-panel__label">Before</div>
            <p>Hundreds of reviews spread across bugs, feature requests, and support complaints.</p>
          </article>
          <article className="proof-panel__item">
            <div className="proof-panel__label">After</div>
            <p>A ranked set of problems, reply drafts, and a weekly summary ready for planning.</p>
          </article>
          <article className="proof-panel__item">
            <div className="proof-panel__label">Decision</div>
            <p>Compare your app against competitors and see where users feel the pain first.</p>
          </article>
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
