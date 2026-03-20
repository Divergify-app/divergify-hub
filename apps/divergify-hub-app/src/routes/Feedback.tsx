import { Link } from "react-router-dom";

const SUPPORT_EMAIL = "chaoscontrol@divergify.app";
const PRIVACY_URL = "https://divergify.app/privacy.html";
const CONTACT_URL = "https://divergify.app/contact.html";

export function Feedback() {
  return (
    <div className="stack">
      <section className="panel stack">
        <div className="badge">Support</div>
        <h1 className="workspace-title">If something breaks, send the shortest clear version of it.</h1>
        <p className="p">
          This release is meant to be used, not tiptoed around. The fastest bug reports tell us what you tried, what
          happened instead, and what device you were on.
        </p>

        <div className="widget-grid">
          <article className="workspace-card stack">
            <span className="metric-label">Email</span>
            <strong>Direct support</strong>
            <p className="mini">Use this for bugs, broken flows, and app-store review issues.</p>
            <a className="btn" href={`mailto:${SUPPORT_EMAIL}?subject=Divergify%20support`}>
              Email support
            </a>
          </article>

          <article className="workspace-card stack">
            <span className="metric-label">Privacy</span>
            <strong>Read the live policy</strong>
            <p className="mini">This is the public policy URL to use in store submission and support replies.</p>
            <a className="btn" href={PRIVACY_URL} target="_blank" rel="noreferrer">
              Open privacy policy
            </a>
          </article>

          <article className="workspace-card stack">
            <span className="metric-label">Updates</span>
            <strong>Release contact page</strong>
            <p className="mini">Use the website contact page if you want release updates or want to send longer notes.</p>
            <a className="btn" href={CONTACT_URL} target="_blank" rel="noreferrer">
              Open contact page
            </a>
          </article>
        </div>
      </section>

      <section className="card stack">
        <div className="badge">What helps us fix it</div>
        <ol className="guide-list">
          <li>What you were trying to do.</li>
          <li>What happened instead.</li>
          <li>Your phone model and Android version.</li>
          <li>Whether Tinfoil Hat was on, if the issue involved sidekicks or extra help.</li>
        </ol>
      </section>

      <section className="card stack">
        <div className="badge">If you want to share app data</div>
        <p className="p">
          You can export your local data from Settings and attach it only if you are comfortable doing that. Exported
          files leave the device only when you choose to share them.
        </p>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Link to="/settings" className="btn primary" style={{ textDecoration: "none" }}>
            Open settings
          </Link>
          <Link to="/legal/privacy" className="btn" style={{ textDecoration: "none" }}>
            Read in-app privacy
          </Link>
        </div>
        <div className="notice">
          Do not send medical records, diagnosis details, insurance information, or crisis information through support.
        </div>
      </section>
    </div>
  );
}
