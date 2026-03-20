
export function LegalPrivacy() {
  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Privacy</div>
        <h2 className="h2">Your data stays on this device unless you ask for more.</h2>
        <p className="p">
          In this release, tasks, habits, focus sessions, chat history, onboarding answers, and settings are stored
          locally on this device. There is no automatic account sync or background cloud backup.
        </p>
        <p className="p">
          If you export data, the file stays wherever you save it. If you share it, you control who sees it.
        </p>
        <div className="stack" style={{ gap: 10 }}>
          <h3 className="h2">When network requests can happen</h3>
          <ul className="guide-list">
            <li>Loading app assets and updates.</li>
            <li>Opening links or integrations you choose, such as Google Calendar, Waze, email, or the Divergify website.</li>
            <li>Requesting optional assisted help in Sidekicks, Magic Tasks, or Lab when Tinfoil Hat is off and assist is available.</li>
          </ul>
          <p className="mini">
            If cloud assist is unavailable, those flows fall back to local behavior instead of blocking the task.
          </p>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          <h3 className="h2">Tinfoil Hat</h3>
          <p className="p">
            Tinfoil Hat blocks cloud assist calls and hides embed-style content. It is a product-level privacy control,
            not a claim of full operating-system or network-level blocking.
          </p>
        </div>
        <div className="stack" style={{ gap: 10 }}>
          <h3 className="h2">Permissions in the current Android build</h3>
          <p className="p">
            The Android manifest currently requests internet access only. This build does not declare microphone,
            camera, or location permission.
          </p>
        </div>
        <div className="notice">
          We do not sell your data or use ad trackers. Productivity support only. Not medical advice, diagnosis, or
          treatment. Full policy: <a href="https://divergify.app/privacy.html" target="_blank" rel="noreferrer">divergify.app/privacy.html</a>
        </div>
      </div>
    </div>
  );
}
