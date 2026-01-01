import { useMemo, useState } from "react";
import { useApp } from "../state/useApp";
import { todayISO } from "../shared/utils";

export function Habits() {
  const { data, actions } = useApp();

  const [name, setName] = useState("");
  const [cue, setCue] = useState("");
  const [tiny, setTiny] = useState("60 seconds");
  const [freq, setFreq] = useState<"daily" | "weekly">("daily");

  const today = todayISO();

  const add = () => {
    const n = name.trim();
    if (!n) return;
    actions.addHabit({ name: n, cue: cue.trim() || undefined, tinyVersion: tiny.trim() || undefined, frequency: freq });
    setName("");
    setCue("");
    setTiny("60 seconds");
    setFreq("daily");
  };

  const recent = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().slice(0, 10));
    }
    return days;
  }, []);

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Habits</div>
        <h2 className="h2">No streak shame. Just check-ins.</h2>
        <p className="p">If it is not doable on a hard day, it is too big. Shrink it.</p>

        <div className="field">
          <label className="label" htmlFor="hName">Habit name</label>
          <input id="hName" className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Example: Drink water" />
        </div>

        <details className="stack">
          <summary className="p" style={{ cursor: "pointer" }}>Make it easier (optional)</summary>

          <div className="field">
            <label className="label" htmlFor="hCue">Cue (when/where)</label>
            <input id="hCue" className="input" value={cue} onChange={(e) => setCue(e.target.value)} placeholder="Example: After coffee" />
          </div>

          <div className="field">
            <label className="label" htmlFor="hTiny">Tiny version</label>
            <input id="hTiny" className="input" value={tiny} onChange={(e) => setTiny(e.target.value)} placeholder="Example: 3 sips" />
          </div>

          <div className="field">
            <label className="label" htmlFor="hFreq">Frequency</label>
            <select id="hFreq" className="select" value={freq} onChange={(e) => setFreq(e.target.value as any)}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </details>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn primary" onClick={add}>Add habit</button>
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="h2">Your habits</h3>
          <span className="badge">{data.habits.length}</span>
        </div>

        {data.habits.length === 0 ? (
          <p className="p">No habits yet. Start with one tiny habit when you are ready.</p>
        ) : (
          <div className="stack">
            {data.habits.map((h) => {
              const done = h.checkins.includes(today);
              return (
                <div key={h.id} className="stack" style={{ gap: 10 }}>
                  <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <label className="row" style={{ alignItems: "flex-start" }}>
                      <input type="checkbox" checked={done} onChange={() => actions.toggleHabitCheckinToday(h.id)} />
                      <div className="stack" style={{ gap: 2 }}>
                        <div style={{ fontWeight: 800 }}>{h.name}</div>
                        <div className="p">
                          {h.cue ? `Cue: ${h.cue}. ` : ""}
                          {h.tinyVersion ? `Tiny: ${h.tinyVersion}. ` : ""}
                          {`(${h.frequency})`}
                        </div>
                      </div>
                    </label>
                    <button className="btn danger" onClick={() => actions.deleteHabit(h.id)}>Delete</button>
                  </div>

                  <div className="row" style={{ flexWrap: "wrap" }}>
                    {recent.map((d) => (
                      <span key={d} className="badge" style={{ borderColor: h.checkins.includes(d) ? "var(--accent)" : "var(--border)" }}>
                        {d.slice(5)}
                      </span>
                    ))}
                  </div>

                  <div className="notice">
                    Backup plan: if you cannot do the habit, do the first 60 seconds. That still counts.
                  </div>

                  <hr className="sep" />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
