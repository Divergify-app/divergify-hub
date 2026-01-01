import { Link } from "react-router-dom";
import { useApp } from "../state/useApp";
import { downloadJson, readTextFile, safeParseJson } from "../shared/utils";
import type { Humor } from "../state/types";

export function Settings() {
  const { data, actions } = useApp();

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
            <div>Shades (low-stim)</div>
            <div className="p">Darker UI, reduced motion, fewer distractions.</div>
          </div>
        </label>

        <label className="row">
          <input
            type="checkbox"
            checked={data.preferences.tinFoil}
            onChange={actions.toggleTinFoil}
          />
          <div className="stack" style={{ gap: 2 }}>
            <div>Tin Foil Hat (privacy)</div>
            <div className="p">Disables integrations and hides embed-style content. No fake security claims.</div>
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
          <h3 className="h2">Loop guard</h3>
          <p className="p">If you are spiraling in chat, this gives you a gentle pause prompt.</p>

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
