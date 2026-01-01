import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../state/useApp";
import { todayISO } from "../shared/utils";
import { FocusTimer } from "../components/FocusTimer";

export function Today() {
  const { data, actions } = useApp();
  const nav = useNavigate();

  const today = todayISO();
  const openTasks = useMemo(() => data.tasks.filter((t) => !t.done), [data.tasks]);
  const doneTasks = useMemo(() => data.tasks.filter((t) => t.done), [data.tasks]);
  const dueToday = useMemo(() => openTasks.filter((t) => t.dueDate === today), [openTasks, today]);

  const doneToday = Boolean(data.doneForTodayAt);

  return (
    <div className="stack">
      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <div className="stack" style={{ gap: 6 }}>
            <div className="badge">Today</div>
            <h2 className="h2">Build the bridge with one small chunk.</h2>
            <p className="p">
              You are not broken. The system is outdated.
              We adapt the system to the brain.
            </p>
          </div>
          <div className="stack" style={{ gap: 8, alignItems: "flex-end" }}>
            <div className="badge">{doneToday ? "DONE FOR TODAY" : "IN PLAY"}</div>
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

        <div className="row" style={{ flexWrap: "wrap" }}>
          <Link to="/tasks" className="btn" style={{ textDecoration: "none" }}>Tasks ({openTasks.length})</Link>
          <Link to="/habits" className="btn" style={{ textDecoration: "none" }}>Habits ({data.habits.length})</Link>
          <Link to="/focus" className="btn" style={{ textDecoration: "none" }}>Focus</Link>
        </div>
      </div>

      <FocusTimer openTasks={openTasks} />

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="h2">Due today</h3>
          <span className="badge">{dueToday.length}</span>
        </div>
        {dueToday.length === 0 ? (
          <p className="p">Nothing due today. That is allowed.</p>
        ) : (
          <div className="stack">
            {dueToday.slice(0, 6).map((t) => (
              <label key={t.id} className="row" style={{ alignItems: "flex-start" }}>
                <input type="checkbox" checked={t.done} onChange={() => actions.toggleTaskDone(t.id)} />
                <div className="stack" style={{ gap: 2 }}>
                  <div>{t.title}</div>
                  {t.notes ? <div className="p">{t.notes}</div> : null}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="h2">Progress snapshot</h3>
          <span className="badge">{doneTasks.length} done</span>
        </div>
        <p className="p">
          Progress is movement, not perfection. No streak shame. No moral score.
        </p>
      </div>
    </div>
  );
}
