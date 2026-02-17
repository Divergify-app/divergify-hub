import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../state/useApp";
import { nowIso, todayISO, uid } from "../shared/utils";
import { FocusTimer } from "../components/FocusTimer";
import { getPersonaCopy } from "../sidekicks/copy";
import { mapOverwhelmToSupportLevel, useSessionState } from "../state/sessionState";
import { generateSidekickTurn } from "../sidekicks/engine";

export function Today() {
  const { data, actions } = useApp();
  const persona = getPersonaCopy(data.activeSidekickId);
  const nav = useNavigate();
  const { session } = useSessionState();
  const supportLevel = session ? mapOverwhelmToSupportLevel(session.overwhelm) : "normal";

  const today = todayISO();
  const openTasks = useMemo(() => data.tasks.filter((t) => !t.done), [data.tasks]);
  const doneTasks = useMemo(() => data.tasks.filter((t) => t.done), [data.tasks]);
  const dueToday = useMemo(() => openTasks.filter((t) => t.dueDate === today), [openTasks, today]);
  const anchorTask = useMemo(() => dueToday[0] ?? openTasks[0] ?? null, [dueToday, openTasks]);

  const doneToday = Boolean(data.doneForTodayAt);

  const openFocusForAnchor = () => {
    if (!anchorTask) {
      nav("/focus");
      return;
    }
    nav(`/focus?target=${encodeURIComponent(anchorTask.id)}`);
  };

  const askSidekickForAnchor = () => {
    actions.setSidekickDrawerOpen(true);
    if (!anchorTask) return;

    const message = `Help me start this task now: "${anchorTask.title}". Give me one 2-minute starter and one follow-up step.`;
    actions.pushChat({
      id: uid(),
      role: "user",
      sidekickId: data.activeSidekickId,
      content: message,
      ts: nowIso()
    });
    actions.pushChat(
      generateSidekickTurn({
        sidekickId: data.activeSidekickId,
        message,
        data,
        supportLevel
      })
    );
  };

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
          {session?.mode === "overloaded" ? (
            <Link to="/focus" className="btn primary" style={{ textDecoration: "none" }}>
              Comfort Quest
            </Link>
          ) : null}
          {session?.mode === "neutral" ? (
            <Link to="/tasks" className="btn primary" style={{ textDecoration: "none" }}>
              Anchor Task
            </Link>
          ) : null}
          {session?.mode === "ready" ? (
            <Link to="/tasks" className="btn" style={{ textDecoration: "none" }}>
              Add scaffold
            </Link>
          ) : null}
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3 className="h2">Launch lane</h3>
          <span className="badge">{anchorTask ? "Anchor ready" : "Needs anchor"}</span>
        </div>
        {anchorTask ? (
          <div className="notice">
            <strong>Current anchor:</strong> {anchorTask.title}
            {anchorTask.dueDate === today ? " (due today)" : ""}
          </div>
        ) : (
          <p className="p">No open tasks yet. Create one tiny anchor task and run one short sprint.</p>
        )}
        <div className="row" style={{ flexWrap: "wrap" }}>
          {anchorTask ? (
            <button className="btn primary" onClick={openFocusForAnchor}>Start sprint on anchor</button>
          ) : (
            <Link to="/tasks" className="btn primary" style={{ textDecoration: "none" }}>Create anchor task</Link>
          )}
          <button className="btn" onClick={askSidekickForAnchor}>
            {anchorTask ? "Ask sidekick to break it down" : "Open sidekick"}
          </button>
          <Link to="/habits" className="btn" style={{ textDecoration: "none" }}>Pair with habit</Link>
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
        <p className="p">{persona.todayProgressNote}</p>
      </div>
    </div>
  );
}
