import { Link } from "react-router-dom";
import { useApp } from "../state/useApp";
import { downloadJson, readTextFile, safeParseJson } from "../shared/utils";
import type { Humor } from "../state/types";
import { useSessionState } from "../state/sessionState";
import { formatNudgeCadence, getSupportProfile, getSupportScale } from "../shared/supportProfile";

export function Settings() {
  const { data, actions } = useApp();
  const { session } = useSessionState();
  const supportProfile = getSupportProfile(session?.overwhelm ?? 50);
  const supportScale = getSupportScale();

  const exportData = () => downloadJson("divergify-export.json", data);

  const importData = async (file: File | null) => {
    if (!file) return;
    const text = await readTextFile(file);
    const parsed = safeParseJson(text);
    if (!parsed.ok) {
      alert(parsed.error);
      return;
    }
    actions.importData(parsed.value);
  };

  const setHumor = (humor: Humor) => actions.setPreferences({ ...data.preferences, humor });

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Settings</div>
        <h2 className="h2">Make it feel right.</h2>
        <p className="p">This is your environment. You control it.</p>

        <label className="row">
          <input
            type="checkbox"
            checked={data.preferences.shades}
            onChange={actions.toggleShades}
          />
          <div className="stack" style={{ gap: 2 }}>
            <div>Shades</div>
            <div className="p">Cuts motion, lowers stimulation, and keeps the interface calmer when the day is loud.</div>
          </div>
        </label>

        <label className="row">
          <input
            type="checkbox"
            checked={data.preferences.lowStim}
            onChange={actions.toggleLowStim}
          />
          <div className="stack" style={{ gap: 2 }}>
            <div>Low Stim Mode</div>
            <div className="p">Turns down visual noise without changing what the app can do.</div>
          </div>
        </label>

        <label className="row">
          <input
            type="checkbox"
            checked={data.preferences.tinFoil}
            onChange={actions.toggleTinFoil}
          />
          <div className="stack" style={{ gap: 2 }}>
            <div>Tinfoil Hat</div>
            <div className="p">
              Blocks cloud assist calls, keeps local sidekicks and tools active, and hides embed-style content.
            </div>
          </div>
        </label>

        <label className="row">
          <input
            type="checkbox"
            checked={data.preferences.systems}
            onChange={actions.toggleSystems}
          />
          <div className="stack" style={{ gap: 2 }}>
            <div>Systems Mode</div>
            <div className="p">
              Switches to literal, unambiguous language throughout the app. No metaphors, idioms, or implied meanings.
              All instructions are numbered. One step at a time. Designed for autistic users who need explicit,
              predictable communication. Activates Soren (Systems) as your sidekick.
            </div>
          </div>
        </label>

        <div className="field">
          <label className="label" htmlFor="humor">Humor</label>
          <select id="humor" className="select" value={data.preferences.humor} onChange={(e) => setHumor(e.target.value as Humor)}>
            <option value="neutral">Neutral</option>
            <option value="light">Light</option>
            <option value="sarcastic_supportive">Sarcastic-supportive</option>
          </select>
          <div className="mini">Sarcastic-supportive is allowed. Mean is not.</div>
        </div>

        <label className="row">
          <input
            type="checkbox"
            checked={data.preferences.reduceMotion}
            onChange={(e) => actions.setPreferences({ ...data.preferences, reduceMotion: e.target.checked })}
          />
          <div className="stack" style={{ gap: 2 }}>
            <div>Reduce motion</div>
            <div className="p">Turns off motion. Shades also forces this on.</div>
          </div>
        </label>

        <div className="field">
          <label className="label" htmlFor="scale">Text size</label>
          <select
            id="scale"
            className="select"
            value={String(data.preferences.fontScale)}
            onChange={(e) => actions.setPreferences({ ...data.preferences, fontScale: Number(e.target.value) })}
          >
            <option value="1">Normal</option>
            <option value="1.1">Large</option>
            <option value="1.2">Extra large</option>
          </select>
        </div>

        <hr className="sep" />

        <div className="card stack" style={{ padding: 14 }}>
          <h3 className="h2">Modes right now</h3>
          <div className="stack" style={{ gap: 10 }}>
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <strong>Support profile</strong>
              <span className="badge">{supportProfile.label}</span>
            </div>
            <div className="mini">
              Daily check-ins move the app through baseline, medium, gentle, and high support. Higher support shortens
              sprint suggestions, lowers the daily cap, and speeds up nudges. High support auto-enables Shades and
              reduced motion.
            </div>
            <div className="mini">
              {supportProfile.description}
            </div>
            <div className="mini">
              Suggested sprint: {supportProfile.focusMinutesDefault} minutes. Daily cap: {supportProfile.dailyTaskCap} core task{supportProfile.dailyTaskCap === 1 ? "" : "s"}.
            </div>
            <div className="mini">
              Shades changes the presentation. Low Stim lowers the visual noise. Tinfoil Hat blocks cloud assist calls and keeps support local.
            </div>
            <div className="support-scale-list">
              {supportScale.map((item) => (
                <div
                  key={item.level}
                  className={`support-scale-item ${item.level === supportProfile.level ? "is-active" : ""}`}
                >
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <strong>{item.label}</strong>
                    <span className="badge">{item.rangeLabel}</span>
                  </div>
                  <div className="mini">{item.description}</div>
                  <div className="mini">
                    Sprint {item.focusMinutesDefault} min • Daily cap {item.dailyTaskCap} • Nudges {formatNudgeCadence(item.nudgeIntervalSeconds)}
                    {item.autoEnableShades ? " • Auto calmer on" : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <hr className="sep" />

        <div className="card stack" style={{ padding: 14 }}>
          <h3 className="h2">Loop guard</h3>
          <p className="p">If you start running in circles in chat, this adds a gentle pause prompt.</p>

          <label className="row">
            <input
              type="checkbox"
              checked={data.preferences.loopGuard.enabled}
              onChange={(e) =>
                actions.setPreferences({
                  ...data.preferences,
                  loopGuard: { ...data.preferences.loopGuard, enabled: e.target.checked }
                })
              }
            />
            <div className="stack" style={{ gap: 2 }}>
              <div>Enable loop guard</div>
              <div className="mini">You can always continue anyway. This is a guardrail, not a rule.</div>
            </div>
          </label>
        </div>

        <hr className="sep" />

        <div className="card stack" style={{ padding: 14 }}>
          <h3 className="h2">Data</h3>
          <div className="row" style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
            <button className="btn primary" onClick={exportData}>Export JSON</button>

            <label className="btn" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
              Import JSON
              <input type="file" accept="application/json" style={{ display: "none" }} onChange={(e) => void importData(e.target.files?.[0] ?? null)} />
            </label>
          </div>

          <div className="mini">Local-first means data is stored on this device unless you export it.</div>
        </div>

        <hr className="sep" />

        <div className="card stack" style={{ padding: 14 }}>
          <h3 className="h2">Legal</h3>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <Link to="/legal/privacy" className="btn" style={{ textDecoration: "none" }}>Privacy</Link>
            <Link to="/legal/terms" className="btn" style={{ textDecoration: "none" }}>Terms</Link>
          </div>
          <div className="mini">Productivity support only. Not medical advice.</div>
        </div>

        <hr className="sep" />

        <button
          className="btn danger"
          onClick={() => {
            const ok = confirm("Reset everything? This clears tasks, habits, focus logs, and chat on this device.");
            if (ok) actions.resetAll();
          }}
        >
          Reset all data
        </button>

        <div className="mini">
          This app provides productivity support. Not medical advice, diagnosis, or treatment.
        </div>
      </div>
    </div>
  );
}
