import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../state/useApp";
import { todayISO } from "../shared/utils";
import { getPersonaCopy } from "../sidekicks/copy";

export function Done() {
  const { data, actions } = useApp();
  const persona = getPersonaCopy(data.activeSidekickId);
  const today = todayISO();

  const doneTasks = useMemo(() => data.tasks.filter((t) => t.done), [data.tasks]);
  const checkedHabits = useMemo(
    () => data.habits.filter((h) => h.checkins.includes(today)),
    [data.habits, today]
  );

  const openTask = useMemo(() => data.tasks.find((t) => !t.done) ?? null, [data.tasks]);

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Done for today</div>
        <h2 className="h2">Stop on purpose. That is the skill.</h2>
        <p className="p">
          This is the exit ramp. No guilt. No bonus quests.
          Close the app when you are ready.
        </p>

        <div className="row" style={{ flexWrap: "wrap" }}>
          <span className="badge">{doneTasks.length} tasks done</span>
          <span className="badge">{checkedHabits.length} habits checked in</span>
          <span className="badge">{data.focus.length} focus sessions logged</span>
        </div>

        <div className="notice">
          One tiny next step for later:
          <div style={{ marginTop: 8, fontWeight: 800 }}>
            {openTask ? openTask.title : persona.doneEmptyOpenTask}
          </div>
          <div className="mini" style={{ marginTop: 6 }}>
            Tomorrow micro-step: do 60 seconds of the easiest part. Then decide.
          </div>
        </div>

        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <Link to="/" className="btn" style={{ textDecoration: "none" }}>Back to Today</Link>
          <button className="btn danger" onClick={() => actions.setDoneForToday(null)}>Undo done-for-today</button>
        </div>

        <div className="mini">
          Productivity support only. Not medical advice, diagnosis, or treatment.
        </div>
      </div>
    </div>
  );
}
