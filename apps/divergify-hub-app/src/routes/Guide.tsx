import { Link } from "react-router-dom";
import { SIDEKICKS } from "../sidekicks/defs";

export function Guide() {
  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Guide</div>
        <h2 className="h2">How Divergify Works</h2>
        <p className="p">
          This is the quick orientation for new users. Use this page as the default answer key when someone asks, "What do all these controls mean?"
        </p>
      </div>

      <div className="card stack">
        <h3 className="h2">Start In 4 Steps</h3>
        <ol className="guide-list">
          <li>Pick a sidekick name that fits your current bandwidth.</li>
          <li>Set one tiny task and one timer.</li>
          <li>Turn on Shades if you need lower stimulation.</li>
          <li>Turn on Tin Foil Hat if you want local-only behavior and no integrations.</li>
        </ol>
      </div>

      <div className="card stack">
        <h3 className="h2">Controls, Plain Language</h3>
        <div className="stack" style={{ gap: 10 }}>
          <div className="notice">
            <strong>Shades:</strong> low-stim mode. Less visual noise and reduced motion.
          </div>
          <div className="notice">
            <strong>Tin Foil Hat:</strong> privacy mode. Disables cloud assist calls and hides embed-style content.
          </div>
          <div className="notice">
            <strong>State Check:</strong> sets support intensity so prompts stay matched to your current load.
          </div>
        </div>
      </div>

      <div className="card stack">
        <h3 className="h2">Sidekick Names</h3>
        <div className="stack" style={{ gap: 10 }}>
          {SIDEKICKS.map((s) => (
            <div key={s.id} className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <strong>{s.name}</strong>
                <span className="badge">{s.role}</span>
              </div>
              <span className="mini">{s.tagline}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card stack">
        <h3 className="h2">FAQ</h3>
        <details>
          <summary className="mini">Why do I still see old persona labels?</summary>
          <p className="p">
            The app is a PWA and may be using cached files. Close and reopen the app once, then refresh. If it still shows old labels, clear site data and reload.
          </p>
        </details>
        <details>
          <summary className="mini">Where is my data stored?</summary>
          <p className="p">
            Local-first on this device. Export is manual. Tin Foil Hat blocks cloud-assist calls.
          </p>
        </details>
        <details>
          <summary className="mini">How do I install this on my phone?</summary>
          <p className="p">
            Open the app in your mobile browser and choose Add to Home Screen from the browser menu.
          </p>
        </details>
        <details>
          <summary className="mini">Can I switch sidekicks later?</summary>
          <p className="p">
            Yes. Go to Sidekicks and switch anytime. You are not locked into one style.
          </p>
        </details>
      </div>

      <div className="row" style={{ flexWrap: "wrap" }}>
        <Link className="btn" to="/sidekicks" style={{ textDecoration: "none" }}>Open Sidekicks</Link>
        <Link className="btn" to="/settings" style={{ textDecoration: "none" }}>Open Settings</Link>
        <Link className="btn" to="/legal/privacy" style={{ textDecoration: "none" }}>Privacy</Link>
      </div>
    </div>
  );
}
