import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useApp } from "../state/useApp";
import { todayISO } from "../shared/utils";
import { getPersonaCopy } from "../sidekicks/copy";
import type { TaskPriority, TaskRecurrence } from "../state/types";
import {
  countByView,
  filterTasksByView,
  priorityLabel,
  recommendedDailyTaskCap,
  sortOpenTasks,
  type TaskView
} from "../shared/tasks";
import { useSessionState } from "../state/sessionState";

function parseTags(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8);
}

function addDays(baseIso: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(baseIso);
  if (!match) return baseIso;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const VIEW_ORDER: TaskView[] = ["today", "upcoming", "overdue", "inbox", "all"];

const RECURRENCE_OPTIONS: Array<{ value: TaskRecurrence; label: string }> = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Every week" },
  { value: "monthly", label: "Every month" }
];

export function Tasks() {
  const { data, actions } = useApp();
  const { session } = useSessionState();
  const persona = getPersonaCopy(data.activeSidekickId);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");
  const [project, setProject] = useState("Inbox");
  const [priority, setPriority] = useState<TaskPriority>(2);
  const [recurrence, setRecurrence] = useState<TaskRecurrence>("none");
  const [estimateMinutes, setEstimateMinutes] = useState("");
  const [view, setView] = useState<TaskView>("today");

  const today = todayISO();
  const openTasks = useMemo(() => sortOpenTasks(data.tasks.filter((task) => !task.done)), [data.tasks]);
  const doneTasks = useMemo(
    () =>
      [...data.tasks.filter((task) => task.done)].sort((a, b) => {
        return Date.parse(b.completedAt ?? b.updatedAt) - Date.parse(a.completedAt ?? a.updatedAt);
      }),
    [data.tasks]
  );
  const visibleOpenTasks = useMemo(() => filterTasksByView(openTasks, view, today), [openTasks, today, view]);
  const viewCounts = useMemo(() => countByView(openTasks, today), [openTasks, today]);
  const projectOptions = useMemo(() => {
    const values = new Set<string>(["Inbox"]);
    for (const task of data.tasks) values.add(task.project || "Inbox");
    return [...values].sort();
  }, [data.tasks]);

  const cap = recommendedDailyTaskCap(session?.overwhelm ?? 50);
  const todayCount = viewCounts.today + viewCounts.overdue;

  const add = () => {
    const t = title.trim();
    if (!t) return;
    const parsedEstimate = Number(estimateMinutes);
    actions.addTask({
      title: t,
      notes: notes.trim() || undefined,
      dueDate: dueDate || undefined,
      tags: parseTags(tags),
      project: project.trim() || "Inbox",
      priority,
      recurrence,
      estimateMinutes: Number.isFinite(parsedEstimate) && parsedEstimate > 0 ? parsedEstimate : undefined
    });
    setTitle("");
    setNotes("");
    setDueDate("");
    setTags("");
    setEstimateMinutes("");
    setPriority(2);
    setRecurrence("none");
  };

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Tasks</div>
        <h2 className="h2">Planner: structured, Divergify brain model</h2>
        <p className="p">{persona.tasksSub}</p>
        <div className="notice">
          <strong>Daily load target:</strong> {cap} key tasks based on your current check-in.
          {" "}You currently have {todayCount} due/overdue in play.
        </div>

        <div className="row" style={{ flexWrap: "wrap" }}>
          {VIEW_ORDER.map((option) => (
            <button
              key={option}
              className={`btn ${view === option ? "primary" : ""}`}
              onClick={() => setView(option)}
            >
              {option[0].toUpperCase() + option.slice(1)} ({viewCounts[option]})
            </button>
          ))}
          <Link to="/calendar" className="btn" style={{ textDecoration: "none" }}>
            Calendar board
          </Link>
        </div>

        <div className="field">
          <label className="label" htmlFor="tTitle">Task title</label>
          <input
            id="tTitle"
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Example: Outline launch page copy"
            onKeyDown={(e) => {
              if (e.key === "Enter") add();
            }}
          />
        </div>

        <div className="row" style={{ flexWrap: "wrap" }}>
          <div className="field" style={{ minWidth: 180, flex: 1 }}>
            <label className="label" htmlFor="tProject">Project</label>
            <input
              id="tProject"
              className="input"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              list="task-projects"
              placeholder="Inbox"
            />
            <datalist id="task-projects">
              {projectOptions.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </div>
          <div className="field" style={{ width: 150 }}>
            <label className="label" htmlFor="tPriority">Priority</label>
            <select
              id="tPriority"
              className="select"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value) as TaskPriority)}
            >
              <option value={1}>P1 - Critical</option>
              <option value={2}>P2 - Important</option>
              <option value={3}>P3 - Normal</option>
              <option value={4}>P4 - Low</option>
            </select>
          </div>
          <div className="field" style={{ width: 180 }}>
            <label className="label" htmlFor="tDue">Due date</label>
            <input id="tDue" className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="field" style={{ width: 170 }}>
            <label className="label" htmlFor="tEstimate">Estimate (min)</label>
            <input
              id="tEstimate"
              className="input"
              type="number"
              min={5}
              step={5}
              value={estimateMinutes}
              onChange={(e) => setEstimateMinutes(e.target.value)}
              placeholder="25"
            />
          </div>
        </div>

        <details className="stack">
          <summary className="p" style={{ cursor: "pointer" }}>Details and repeat settings</summary>
          <div className="field">
            <label className="label" htmlFor="tNotes">Notes</label>
            <textarea id="tNotes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything future-you should know" />
          </div>

          <div className="row" style={{ flexWrap: "wrap", alignItems: "flex-end" }}>
            <div className="field" style={{ minWidth: 220 }}>
              <label className="label" htmlFor="tRecurrence">Repeat</label>
              <select
                id="tRecurrence"
                className="select"
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as TaskRecurrence)}
              >
                {RECURRENCE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="field" style={{ minWidth: 220, flex: 1 }}>
              <label className="label" htmlFor="tTags">Tags (comma separated)</label>
              <input id="tTags" className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Example: admin, writing" />
            </div>
          </div>
        </details>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn primary" onClick={add}>Add</button>
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="h2">Open: {view[0].toUpperCase() + view.slice(1)}</h3>
          <span className="badge">{visibleOpenTasks.length}</span>
        </div>

        {visibleOpenTasks.length === 0 ? (
          <p className="p">{persona.tasksEmptyOpen}</p>
        ) : (
          <div className="stack">
            {visibleOpenTasks.map((task) => (
              <div key={task.id} className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <label className="row" style={{ alignItems: "flex-start", flex: 1 }}>
                  <input type="checkbox" checked={task.done} onChange={() => actions.toggleTaskDone(task.id)} />
                  <div className="stack" style={{ gap: 2 }}>
                    <div>{task.title}</div>
                    <div className="p">
                      {task.project} • {priorityLabel(task.priority)}
                      {task.dueDate ? ` • Due ${task.dueDate === today ? "today" : task.dueDate}` : " • No due date"}
                      {task.recurrence !== "none" ? ` • Repeats ${task.recurrence}` : ""}
                      {task.estimateMinutes ? ` • ${task.estimateMinutes}m` : ""}
                      {task.tags.length ? ` • Tags: ${task.tags.join(", ")}` : ""}
                      {task.notes ? ` • ${task.notes}` : ""}
                    </div>
                    <div className="row" style={{ flexWrap: "wrap" }}>
                      {task.dueDate !== today ? (
                        <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: today })}>Today</button>
                      ) : null}
                      <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: addDays(today, 1) })}>Tomorrow</button>
                      <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: addDays(today, 7) })}>+7d</button>
                    </div>
                  </div>
                </label>
                <button className="btn danger" onClick={() => actions.deleteTask(task.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="h2">Done</h3>
          <span className="badge">{doneTasks.length}</span>
        </div>

        {doneTasks.length === 0 ? (
          <p className="p">{persona.tasksEmptyDone}</p>
        ) : (
          <div className="stack">
            {doneTasks.slice(0, 20).map((task) => (
              <div key={task.id} className="row" style={{ justifyContent: "space-between" }}>
                <label className="row" style={{ alignItems: "flex-start", flex: 1 }}>
                  <input type="checkbox" checked={task.done} onChange={() => actions.toggleTaskDone(task.id)} />
                  <div className="stack" style={{ gap: 2 }}>
                    <div>{task.title}</div>
                    <div className="p">
                      {task.project} • {priorityLabel(task.priority)}
                      {task.completedAt ? ` • Done ${task.completedAt.slice(0, 10)}` : ""}
                    </div>
                  </div>
                </label>
                <button className="btn" onClick={() => actions.deleteTask(task.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
