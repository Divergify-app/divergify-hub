import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../state/useApp";
import { FocusTimer } from "../components/FocusTimer";
import { getPersonaCopy } from "../sidekicks/copy";

export function Focus() {
  const { data, actions } = useApp();
  const persona = getPersonaCopy(data.activeSidekickId);
  const nav = useNavigate();
  const openTasks = useMemo(() => data.tasks.filter((t) => !t.done), [data.tasks]);

  return (
    <div className="stack">
      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 6 }}>
            <div className="badge">Focus</div>
            <h2 className="h2">{persona.focusHeading}</h2>
            <p className="p">{persona.focusSub}</p>
          </div>
          <button
            className="btn primary"
            onClick={() => {
              actions.setDoneForToday(new Date().toISOString());
              nav("/done");
            }}
          >
            Done for today
          </button>
        </div>
      </div>

      <FocusTimer openTasks={openTasks} />

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="h2">Recent sessions</h3>
          <span className="badge">{data.focus.length}</span>
        </div>

        {data.focus.length === 0 ? (
          <p className="p">{persona.focusEmptySessions}</p>
        ) : (
          <div className="stack">
            {data.focus.slice(0, 10).map((s) => (
              <div key={s.id} className="card" style={{ padding: 12 }}>
                <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
                  <div style={{ fontWeight: 800 }}>{s.label}</div>
                  <span className="badge">{s.minutesPlanned} min • {s.outcome}</span>
                </div>
                <div className="mini">
                  {new Date(s.startedAt).toLocaleString()} {"->"} {new Date(s.endedAt).toLocaleString()}
                </div>
                {s.notes ? <div className="p">{s.notes}</div> : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
