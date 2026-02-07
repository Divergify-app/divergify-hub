import { useApp } from "../state/useApp";
import { SIDEKICKS } from "../sidekicks/defs";

export function Sidekicks() {
  const { data, actions } = useApp();

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Sidekicks</div>
        <h2 className="h2">Different brains need different tools.</h2>
        <p className="p">Pick a personality. Switch anytime. You are not locked in.</p>

        <div className="stack">
          {SIDEKICKS.map((s) => (
            <div key={s.id} className="card" style={{ padding: 14 }}>
              <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div className="stack" style={{ gap: 4 }}>
                  <div style={{ fontWeight: 900 }}>{s.name}</div>
                  <div className="p">{s.tagline}</div>
                  <div className="mini">{s.description}</div>
                </div>
                <button
                  className={`btn ${data.activeSidekickId === s.id ? "primary" : ""}`}
                  onClick={() => actions.setActiveSidekickId(s.id)}
                >
                  {data.activeSidekickId === s.id ? "Active" : "Use this"}
                </button>
              </div>
              <div className="mini" style={{ marginTop: 10 }}>
                Focus: {s.focus.join(" • ")}
              </div>
              <div className="mini" style={{ marginTop: 6 }}>
                Boundaries: {s.boundaries.join(" • ")}
              </div>
            </div>
          ))}
        </div>

        <div className="notice">
          Tip: If you cannot decide, stick with Takota until your brain calms down. Default is a feature.
        </div>
      </div>
    </div>
  );
}
