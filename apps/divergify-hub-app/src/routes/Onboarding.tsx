import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state/useApp";
import type { Humor, SidekickId } from "../state/types";
import { SIDEKICKS, getSidekick } from "../sidekicks/defs";

export function Onboarding() {
  const { data, actions } = useApp();
  const nav = useNavigate();

  const [step, setStep] = useState(0);
  const [firstTask, setFirstTask] = useState("");
  const [firstHabit, setFirstHabit] = useState("");

  const next = () => setStep((s) => Math.min(2, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const finish = () => {
    if (firstTask.trim()) actions.addTask({ title: firstTask.trim() });
    if (firstHabit.trim()) actions.addHabit({ name: firstHabit.trim(), frequency: "daily", tinyVersion: "60 seconds" });
    actions.setHasOnboarded(true);
    nav("/", { replace: true });
  };

  const setHumor = (humor: Humor) => actions.setPreferences({ ...data.preferences, humor });

  const setSidekick = (id: SidekickId) => actions.setActiveSidekickId(id);
  const activeSidekick = getSidekick(data.activeSidekickId);

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Onboarding</div>
        <h2 className="h2">{activeSidekick.name} here.</h2>
        <p className="p">
          You opened Divergify. That counts as progress.
          Now we pick settings that do not fight your brain.
        </p>

        {step === 0 ? (
          <div className="stack">
            <h3 className="h2">Choose a default personality</h3>
            <p className="p">If you do not choose, you get Takota. That is fine. He is built for uncertainty.</p>

            <div className="row" style={{ flexWrap: "wrap" }}>
              {SIDEKICKS.map((s) => (
                <button
                  key={s.id}
                  className={`btn ${data.activeSidekickId === s.id ? "primary" : ""}`}
                  onClick={() => setSidekick(s.id)}
                >
                  {s.name}
                </button>
              ))}
            </div>

            <div className="card" style={{ padding: 14 }}>
              <div className="row" style={{ gap: 8, alignItems: "center" }}>
                <div style={{ fontWeight: 900 }}>{activeSidekick.name}</div>
                <span className="badge">{activeSidekick.role}</span>
              </div>
              <div className="p">{activeSidekick.tagline}</div>
              <div className="mini" style={{ marginTop: 6 }}>{activeSidekick.description}</div>
              <div className="mini" style={{ marginTop: 6 }}>
                Focus: {activeSidekick.focus.join(" • ")}
              </div>
            </div>

            <div className="field">
              <label className="label" htmlFor="humor">Humor</label>
              <select id="humor" className="select" value={data.preferences.humor} onChange={(e) => setHumor(e.target.value as Humor)}>
                <option value="neutral">Neutral</option>
                <option value="light">Light</option>
                <option value="sarcastic_supportive">Sarcastic-supportive</option>
              </select>
              <div className="mini">Sarcastic-supportive roasts the chaos, not the person.</div>
            </div>

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn primary" onClick={next}>Next</button>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="stack">
            <h3 className="h2">Make the first bridge step</h3>
            <div className="field">
              <label className="label" htmlFor="firstTask">First tiny task</label>
              <input id="firstTask" className="input" value={firstTask} onChange={(e) => setFirstTask(e.target.value)} placeholder="Example: Write 3 bullets" />
            </div>
            <div className="field">
              <label className="label" htmlFor="firstHabit">Optional: one habit</label>
              <input id="firstHabit" className="input" value={firstHabit} onChange={(e) => setFirstHabit(e.target.value)} placeholder="Example: Drink water" />
              <div className="mini">No streak pressure. Just check-ins.</div>
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="btn" onClick={back}>Back</button>
              <button className="btn primary" onClick={next}>Next</button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="stack">
            <h3 className="h2">Modes (you control the environment)</h3>

            <label className="row">
              <input type="checkbox" checked={data.preferences.shades} onChange={actions.toggleShades} />
              <div className="stack" style={{ gap: 2 }}>
                <div>Shades (low-stim)</div>
                <div className="p">Darker UI, reduced motion, fewer distractions.</div>
              </div>
            </label>

            <label className="row">
              <input type="checkbox" checked={data.preferences.tinFoil} onChange={actions.toggleTinFoil} />
              <div className="stack" style={{ gap: 2 }}>
                <div>Tin Foil Hat (privacy)</div>
                <div className="p">Disables integrations and hides embed-style content. No fake security claims.</div>
              </div>
            </label>

            <div className="notice">
              This app provides productivity support. Not medical advice, diagnosis, or treatment.
            </div>

            <div className="row" style={{ justifyContent: "space-between" }}>
              <button className="btn" onClick={back}>Back</button>
              <button className="btn primary" onClick={finish}>Finish</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
