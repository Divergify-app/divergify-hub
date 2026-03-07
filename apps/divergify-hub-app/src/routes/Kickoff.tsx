import { Link, useNavigate } from "react-router-dom";
import { useMemo } from "react";
import { useApp } from "../state/useApp";
import { useSessionState } from "../state/sessionState";
import { pickAnchorTask, sortOpenTasks } from "../shared/tasks";
import { todayISO } from "../shared/utils";

export function Kickoff() {
  const { data, actions } = useApp();
  const { session, checkInRequired } = useSessionState();
  const nav = useNavigate();

  const today = todayISO();
  const openTasks = useMemo(() => sortOpenTasks(data.tasks.filter((task) => !task.done)), [data.tasks]);
  const dueTodayCount = openTasks.filter((task) => task.dueDate === today).length;
  const anchor = useMemo(() => pickAnchorTask(openTasks, today), [openTasks, today]);
  const focusTodayCount = useMemo(
    () => data.focus.filter((sessionItem) => sessionItem.startedAt.slice(0, 10) === today).length,
    [data.focus, today]
  );

  const stateReady = Boolean(session) && !checkInRequired;
  const tasksReady = openTasks.length > 0;
  const focusReady = focusTodayCount > 0;

  const checklistDoneCount = [stateReady, tasksReady, focusReady].filter(Boolean).length;

  const completeKickoff = () => {
    actions.setHasCompletedKickoff(true);
    nav("/", { replace: true });
  };

  const addStarterTasks = () => {
    const seedTasks = [
      { title: "Choose one anchor task", priority: 1 as const, dueDate: today },
      { title: "Run one 15-minute focus sprint", priority: 2 as const, dueDate: today },
      { title: "Write tomorrow's first micro-step", priority: 2 as const, dueDate: today }
    ];
    for (const task of seedTasks) {
      actions.addTask({
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate,
        project: "Kickoff",
        recurrence: "none"
      });
    }
  };

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Kickoff Flow</div>
        <h2 className="h2">Clear next steps, no guesswork.</h2>
        <p className="p">
          This is the post-onboarding launch lane. Complete these three checks once, then roll into normal daily flow.
        </p>
        <div className="notice">
          <strong>Progress:</strong> {checklistDoneCount}/3 setup checks complete.
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3 className="h2">1) State check-in</h3>
          <span className="badge">{stateReady ? "Done" : "Needs action"}</span>
        </div>
        <p className="p">Set your current overwhelm level so the app adjusts support and daily load.</p>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <button className="btn primary" onClick={() => nav("/", { replace: true })}>
            Open Today and tap "Open state check-in"
          </button>
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3 className="h2">2) Build today's list</h3>
          <span className="badge">{tasksReady ? "Done" : "Needs action"}</span>
        </div>
        <p className="p">
          Open tasks: {openTasks.length}. Due today: {dueTodayCount}. Anchor: {anchor ? anchor.title : "none yet"}.
        </p>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Link to="/tasks" className="btn primary" style={{ textDecoration: "none" }}>
            Open planner
          </Link>
          {!tasksReady ? (
            <button className="btn" onClick={addStarterTasks}>
              Add starter tasks
            </button>
          ) : null}
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3 className="h2">3) Run first focus sprint</h3>
          <span className="badge">{focusReady ? "Done" : "Needs action"}</span>
        </div>
        <p className="p">
          Focus sessions today: {focusTodayCount}. Goal is one sprint to lock the habit loop.
        </p>
        <div className="row" style={{ flexWrap: "wrap" }}>
          <Link to="/focus" className="btn primary" style={{ textDecoration: "none" }}>
            Start focus
          </Link>
        </div>
      </div>

      <div className="card stack">
        <h3 className="h2">What happens next</h3>
        <ol className="guide-list">
          <li>Start each day in Today to pick the anchor task.</li>
          <li>Use Tasks to schedule, prioritize, and repeat recurring work.</li>
          <li>Use Focus for sprint execution and Sidekicks for nudges and breakdowns.</li>
        </ol>
        <div className="row" style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
          <button className="btn" onClick={completeKickoff}>
            Skip for now
          </button>
          <button className="btn primary" onClick={completeKickoff}>
            Finish setup and enter app
          </button>
        </div>
      </div>
    </div>
  );
}
