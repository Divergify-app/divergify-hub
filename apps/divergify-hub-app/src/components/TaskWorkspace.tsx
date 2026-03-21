import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useApp } from "../state/useApp";
import { mapOverwhelmToSupportLevel, useSessionState } from "../state/sessionState";
import { downloadTaskIcs, openGoogleCalendarForTask, openWazeForTask, syncStartAtWithDueDate } from "../shared/integrations";
import { getSupportProfile } from "../shared/supportProfile";
import { nowIso, todayISO, uid } from "../shared/utils";
import { requestSidekickTurn } from "../shared/sidekickAssist";
import {
  checklistProgress,
  countByView,
  filterTasksByView,
  isOverdue,
  isToday,
  isUpcoming,
  pickAnchorTask,
  priorityLabel,
  recommendedDailyTaskCap,
  sortOpenTasks,
  type TaskView
} from "../shared/tasks";
import type { Task, TaskPriority, TaskRecurrence } from "../state/types";
import { getSidekick } from "../sidekicks/defs";

type WorkspaceMode = "today" | "planner";
type WorkspaceView = TaskView | "done";

type TaskSectionProps = {
  badge: string;
  title: string;
  emptyCopy: string;
  tasks: Task[];
  today: string;
  selectedTaskId: string;
  onSelect: (taskId: string) => void;
  onToggleDone: (taskId: string) => void;
  footer?: ReactNode;
};

type TaskDetailProps = {
  mode: WorkspaceMode;
  task: Task | null;
  anchorTask: Task | null;
  today: string;
  projectOptions: string[];
  onSelectTask: (taskId: string) => void;
  onToggleDone: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onOpenFocus: (taskId: string) => void;
  onBreakDown: (title: string) => void;
  onAskSidekick: (task: Task | null) => void;
  sidekickBusy: boolean;
};

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 1, label: "P1" },
  { value: 2, label: "P2" },
  { value: 3, label: "P3" },
  { value: 4, label: "P4" }
];

const RECURRENCE_OPTIONS: Array<{ value: TaskRecurrence; label: string }> = [
  { value: "none", label: "No repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekdays", label: "Weekdays" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" }
];

const VIEW_ORDER: WorkspaceView[] = ["today", "inbox", "upcoming", "overdue", "all", "done"];

function parseTags(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .slice(0, 8);
}

function addDays(baseIso: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(baseIso);
  if (!match) return baseIso;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function mergeTaskLists(...groups: Task[][]) {
  const seen = new Set<string>();
  const merged: Task[] = [];
  for (const group of groups) {
    for (const task of group) {
      if (seen.has(task.id)) continue;
      seen.add(task.id);
      merged.push(task);
    }
  }
  return merged;
}

function TaskSection(props: TaskSectionProps) {
  const { badge, title, emptyCopy, tasks, today, selectedTaskId, onSelect, onToggleDone, footer } = props;

  return (
    <section className="workspace-card stack">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 4 }}>
          <div className="badge">{badge}</div>
          <h3 className="h2">{title}</h3>
        </div>
        <span className="badge">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <div className="task-empty">{emptyCopy}</div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`task-row ${selectedTaskId === task.id ? "selected" : ""}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(task.id)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelect(task.id);
                }
              }}
            >
              <input
                className="task-check"
                type="checkbox"
                checked={task.done}
                onClick={(event) => event.stopPropagation()}
                onChange={() => onToggleDone(task.id)}
              />
              <div className="task-main">
                <div className="task-title">{task.title}</div>
                <div className="task-meta">
                  <span>{task.project}</span>
                  <span>{priorityLabel(task.priority)}</span>
                  {task.dueDate ? <span>{task.dueDate === today ? "Today" : task.dueDate}</span> : <span>Inbox</span>}
                  {task.estimateMinutes ? <span>{task.estimateMinutes}m</span> : null}
                  {task.checklist.length ? (
                    <span>
                      {checklistProgress(task).done}/{task.checklist.length} steps
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {footer ?? null}
    </section>
  );
}

function TaskChecklistEditor({ task }: { task: Task }) {
  const { actions } = useApp();
  const [newItemText, setNewItemText] = useState("");
  const progress = checklistProgress(task);

  const addItem = () => {
    const cleanText = newItemText.trim();
    if (!cleanText) return;
    actions.addTaskChecklistItem(task.id, cleanText);
    setNewItemText("");
  };

  return (
    <section className="workspace-card stack">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 4 }}>
          <div className="badge">Steps</div>
          <h3 className="h2">{progress.total ? `${progress.done}/${progress.total} complete` : "No steps yet"}</h3>
        </div>
        <span className="badge">{progress.total}</span>
      </div>

      <p className="p">
        Turn the task into a checklist so it stops being a decorative promise and becomes a sequence you can actually finish.
      </p>

      <div className="quick-add-main">
        <input
          className="input quick-add-input"
          value={newItemText}
          onChange={(event) => setNewItemText(event.target.value)}
          placeholder="Add a step, prep item, or errand"
          onKeyDown={(event) => {
            if (event.key === "Enter") addItem();
          }}
        />
        <button className="btn primary" onClick={addItem}>
          Add step
        </button>
      </div>

      {task.checklist.length === 0 ? (
        <div className="task-empty">No steps yet. Add the first concrete move.</div>
      ) : (
        <div className="task-list task-list-large">
          {task.checklist.map((item) => (
            <div key={item.id} className="task-row">
              <input
                className="task-check"
                type="checkbox"
                checked={item.done}
                onChange={() => actions.toggleTaskChecklistItem(task.id, item.id)}
              />
              <div className="task-main">
                <input
                  className="input"
                  value={item.text}
                  onChange={(event) => actions.updateTaskChecklistItem(task.id, item.id, event.target.value)}
                />
              </div>
              <button className="btn danger" onClick={() => actions.deleteTaskChecklistItem(task.id, item.id)}>
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function TaskDetail(props: TaskDetailProps) {
  const {
    mode,
    task,
    anchorTask,
    today,
    projectOptions,
    onSelectTask,
    onToggleDone,
    onDelete,
    onOpenFocus,
    onBreakDown,
    onAskSidekick,
    sidekickBusy
  } = props;
  const { actions } = useApp();
  const [tagText, setTagText] = useState("");

  useEffect(() => {
    setTagText(task?.tags.join(", ") ?? "");
  }, [task?.id, task?.tags]);

  if (!task) {
    return (
      <section className="workspace-card stack">
        <div className="badge">{mode === "today" ? "Start here" : "Task detail"}</div>
        <h3 className="h2">
          {mode === "today" ? "You do not need to open the full editor first." : "Pick a task to edit the details."}
        </h3>
        <p className="p">
          {mode === "today"
            ? "Start with the anchor or one due-now task. Open the editor only when you actually need to change the plan."
            : "Divergify keeps the list visible and the task editor close, so you do not lose the thread every time you need to adjust the plan."}
        </p>
        {mode === "today" ? (
          <>
            <ol className="guide-list">
              <li>Pick the anchor task or the first due-now task.</li>
              <li>Use Focus or Ask sidekick if you need help starting.</li>
              <li>Use Brain Dump if your head is louder than the list.</li>
            </ol>
            <div className="row" style={{ flexWrap: "wrap" }}>
              {anchorTask ? (
                <button className="btn primary" onClick={() => onSelectTask(anchorTask.id)}>
                  Select anchor task
                </button>
              ) : null}
              {anchorTask ? (
                <button className="btn" onClick={() => onOpenFocus(anchorTask.id)}>
                  Focus on anchor
                </button>
              ) : null}
              <button className="btn" onClick={() => onAskSidekick(anchorTask ?? null)} disabled={sidekickBusy}>
                {sidekickBusy ? "Asking..." : "Ask sidekick"}
              </button>
              <Link to="/brain-dump" className="btn" style={{ textDecoration: "none" }}>
                Brain dump
              </Link>
            </div>
          </>
        ) : null}
      </section>
    );
  }

  return (
    <section className="workspace-card stack">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 4 }}>
          <div className="badge">Task detail</div>
          <h3 className="h2">{task.done ? "Closed loop" : "Open loop"}</h3>
        </div>
        <span className="badge">{task.done ? "Done" : "Active"}</span>
      </div>

      <div className="field">
        <label className="label" htmlFor="task-detail-title">Title</label>
        <input
          id="task-detail-title"
          className="input"
          value={task.title}
          onChange={(event) => actions.updateTask(task.id, { title: event.target.value })}
        />
      </div>

      <div className="task-editor-grid">
        <div className="field">
          <label className="label" htmlFor="task-detail-project">Project</label>
          <input
            id="task-detail-project"
            className="input"
            value={task.project}
            list="task-detail-projects"
            onChange={(event) => actions.updateTask(task.id, { project: event.target.value })}
          />
          <datalist id="task-detail-projects">
            {projectOptions.map((option) => (
              <option key={option} value={option} />
            ))}
          </datalist>
        </div>

        <div className="field">
          <label className="label" htmlFor="task-detail-due">Due date</label>
          <input
            id="task-detail-due"
            className="input"
            type="date"
            value={task.dueDate ?? ""}
            onChange={(event) => {
              const dueDate = event.target.value ? event.target.value : undefined;
              actions.updateTask(task.id, {
                dueDate,
                startAt: dueDate ? syncStartAtWithDueDate(task.startAt, dueDate) : undefined
              });
            }}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="task-detail-start">Start time</label>
          <input
            id="task-detail-start"
            className="input"
            type="datetime-local"
            value={task.startAt ?? ""}
            onChange={(event) => {
              const startAt = event.target.value ? event.target.value : undefined;
              actions.updateTask(task.id, {
                startAt,
                dueDate: startAt ? startAt.slice(0, 10) : task.dueDate
              });
            }}
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="task-detail-location">Location / address</label>
          <input
            id="task-detail-location"
            className="input"
            value={task.location ?? ""}
            onChange={(event) => actions.updateTask(task.id, { location: event.target.value || undefined })}
            placeholder="123 Main St, Atlanta"
          />
        </div>

        <div className="field">
          <label className="label" htmlFor="task-detail-priority">Priority</label>
          <select
            id="task-detail-priority"
            className="select"
            value={task.priority}
            onChange={(event) => actions.updateTask(task.id, { priority: Number(event.target.value) as TaskPriority })}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="task-detail-repeat">Repeat</label>
          <select
            id="task-detail-repeat"
            className="select"
            value={task.recurrence}
            onChange={(event) =>
              actions.updateTask(task.id, { recurrence: event.target.value as TaskRecurrence })
            }
          >
            {RECURRENCE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="label" htmlFor="task-detail-estimate">Estimate (min)</label>
          <input
            id="task-detail-estimate"
            className="input"
            type="number"
            min={5}
            step={5}
            value={task.estimateMinutes ?? ""}
            onChange={(event) =>
              actions.updateTask(task.id, {
                estimateMinutes: event.target.value ? Math.max(5, Number(event.target.value)) : undefined
              })
            }
          />
        </div>

        <div className="field task-tags-field">
          <label className="label" htmlFor="task-detail-tags">Tags</label>
          <input
            id="task-detail-tags"
            className="input"
            value={tagText}
            onChange={(event) => setTagText(event.target.value)}
            onBlur={() => actions.updateTask(task.id, { tags: parseTags(tagText) })}
            placeholder="admin, errands, launch"
          />
        </div>
      </div>

      <div className="field">
        <label className="label" htmlFor="task-detail-notes">Notes</label>
        <textarea
          id="task-detail-notes"
          className="textarea"
          value={task.notes ?? ""}
          onChange={(event) => actions.updateTask(task.id, { notes: event.target.value || undefined })}
          placeholder="Anything future-you will need to re-enter cleanly."
        />
      </div>

      <div className="task-chip-row">
        <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: today, startAt: syncStartAtWithDueDate(task.startAt, today) })}>
          Today
        </button>
        <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: addDays(today, 1), startAt: syncStartAtWithDueDate(task.startAt, addDays(today, 1)) })}>
          Tomorrow
        </button>
        <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: addDays(today, 7), startAt: syncStartAtWithDueDate(task.startAt, addDays(today, 7)) })}>
          +7d
        </button>
        <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: undefined, startAt: undefined })}>
          Inbox
        </button>
      </div>

      <div className="task-action-row">
        <button className="btn" onClick={() => openGoogleCalendarForTask(task)} disabled={!task.dueDate && !task.startAt}>
          Add to Google Calendar
        </button>
        <button className="btn" onClick={() => downloadTaskIcs(task)} disabled={!task.dueDate && !task.startAt}>
          Download .ics
        </button>
        <button className="btn" onClick={() => openWazeForTask(task)} disabled={!task.location?.trim()}>
          Open in Waze
        </button>
      </div>

      <div className="mini">
        Add a start time for a timed calendar event. Add an address if this task should hand off to Waze.
      </div>

      <div className="task-action-row">
        {!task.done ? <button className="btn primary" onClick={() => onOpenFocus(task.id)}>Start focus</button> : null}
        <button className="btn" onClick={() => onBreakDown(task.title)}>Break it down</button>
        <button className="btn" onClick={() => onAskSidekick(task)} disabled={sidekickBusy}>
          {sidekickBusy ? "Asking..." : "Ask sidekick"}
        </button>
        <button className="btn" onClick={() => onToggleDone(task.id)}>
          {task.done ? "Reopen" : "Mark done"}
        </button>
        <button className="btn danger" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </section>
  );
}

export function TaskWorkspace(props: { mode: WorkspaceMode; onOpenCheckIn: () => void }) {
  const { mode, onOpenCheckIn } = props;
  const { data, actions } = useApp();
  const { session, checkInRequired } = useSessionState();
  const sidekick = getSidekick(data.activeSidekickId);
  const nav = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const today = todayISO();
  const [view, setView] = useState<WorkspaceView>(mode === "today" ? "today" : "all");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("Inbox");
  const [dueDate, setDueDate] = useState(mode === "today" ? today : "");
  const [priority, setPriority] = useState<TaskPriority>(mode === "today" ? 2 : 3);
  const [sidekickBusy, setSidekickBusy] = useState(false);

  const supportLevel = session ? mapOverwhelmToSupportLevel(session.overwhelm) : "normal";
  const supportProfile = getSupportProfile(session?.overwhelm ?? 50);
  const projectFilter = mode === "planner" ? searchParams.get("project")?.trim() || "" : "";

  const openTasks = useMemo(() => sortOpenTasks(data.tasks.filter((task) => !task.done)), [data.tasks]);
  const doneTasks = useMemo(
    () =>
      [...data.tasks.filter((task) => task.done)].sort((a, b) => {
        return Date.parse(b.completedAt ?? b.updatedAt) - Date.parse(a.completedAt ?? a.updatedAt);
      }),
    [data.tasks]
  );
  const dueToday = useMemo(() => openTasks.filter((task) => isToday(task, today)), [openTasks, today]);
  const overdue = useMemo(() => openTasks.filter((task) => isOverdue(task, today)), [openTasks, today]);
  const upcoming = useMemo(() => openTasks.filter((task) => isUpcoming(task, today)), [openTasks, today]);
  const inbox = useMemo(() => openTasks.filter((task) => !task.dueDate), [openTasks]);
  const later = useMemo(
    () =>
      openTasks.filter(
        (task) => task.dueDate && !isToday(task, today) && !isOverdue(task, today) && !isUpcoming(task, today)
      ),
    [openTasks, today]
  );
  const anchorTask = useMemo(() => pickAnchorTask(openTasks, today), [openTasks, today]);
  const plannerOpenTasks = useMemo(
    () => (projectFilter ? openTasks.filter((task) => task.project === projectFilter) : openTasks),
    [openTasks, projectFilter]
  );
  const plannerDoneTasks = useMemo(
    () => (projectFilter ? doneTasks.filter((task) => task.project === projectFilter) : doneTasks),
    [doneTasks, projectFilter]
  );
  const viewCounts = useMemo(() => {
    const counts = countByView(plannerOpenTasks, today);
    return { ...counts, done: plannerDoneTasks.length };
  }, [plannerDoneTasks.length, plannerOpenTasks, today]);
  const visiblePlannerTasks = useMemo(() => {
    if (view === "done") return plannerDoneTasks;
    return filterTasksByView(plannerOpenTasks, view, today);
  }, [plannerDoneTasks, plannerOpenTasks, today, view]);
  const projectOptions = useMemo(() => {
    const values = new Set<string>(["Inbox"]);
    for (const task of data.tasks) values.add(task.project || "Inbox");
    return [...values].sort();
  }, [data.tasks]);
  const habitsDoneToday = useMemo(
    () => data.habits.filter((habit) => habit.checkins.includes(today)).length,
    [data.habits, today]
  );
  const focusTodayCount = useMemo(
    () => data.focus.filter((sessionItem) => sessionItem.startedAt.slice(0, 10) === today).length,
    [data.focus, today]
  );

  const readyNow = mergeTaskLists(overdue, dueToday).slice(0, 8);
  const dashboardSelectable = mergeTaskLists(anchorTask ? [anchorTask] : [], readyNow, inbox, upcoming, later).slice(0, 24);
  const selectableTasks = mode === "planner" ? visiblePlannerTasks : dashboardSelectable;
  const selectedTask = data.tasks.find((task) => task.id === selectedTaskId) ?? null;
  const dailyCap = recommendedDailyTaskCap(session?.overwhelm ?? 50);

  useEffect(() => {
    if (mode === "today") setView("today");
  }, [mode]);

  useEffect(() => {
    if (mode !== "planner") return;
    if (!projectFilter) return;
    setProject(projectFilter);
  }, [mode, projectFilter]);

  useEffect(() => {
    if (selectedTaskId && selectableTasks.some((task) => task.id === selectedTaskId)) return;
    if (mode === "today") {
      setSelectedTaskId("");
      return;
    }
    setSelectedTaskId(selectableTasks[0]?.id ?? "");
  }, [mode, selectableTasks, selectedTaskId]);

  const addTask = () => {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;
    const createdId = actions.addTask({
      title: cleanTitle,
      project: project.trim() || "Inbox",
      dueDate: dueDate || undefined,
      priority,
      recurrence: "none"
    });
    setTitle("");
    setDueDate(mode === "today" ? today : "");
    setPriority(mode === "today" ? 2 : 3);
    if (createdId) {
      setSelectedTaskId(createdId);
    }
  };

  const seedStarterTasks = () => {
    const starters = [
      { title: "Pick one anchor task", priority: 1 as const, dueDate: today, project: "Today" },
      { title: "Run a 15-minute focus sprint", priority: 2 as const, dueDate: today, project: "Focus" },
      { title: "Write tomorrow's first tiny step", priority: 2 as const, dueDate: addDays(today, 1), project: "Today" }
    ];
    for (const task of starters) {
      actions.addTask({
        title: task.title,
        priority: task.priority,
        dueDate: task.dueDate,
        project: task.project,
        recurrence: "none"
      });
    }
  };

  const askSidekick = async (task: Task | null) => {
    const content = task
      ? `Help me start "${task.title}" right now. Give me one 2-minute starter and one follow-up step.`
      : "Help me pick one tiny next step from this list.";

    actions.setSidekickDrawerOpen(true);
    actions.pushChat({
      id: uid(),
      role: "user",
      sidekickId: data.activeSidekickId,
      content,
      ts: nowIso()
    });
    setSidekickBusy(true);
    try {
      const result = await requestSidekickTurn({
        message: content,
        data,
        supportLevel,
        sidekickId: data.activeSidekickId
      });
      actions.pushChat(result.turn);
    } finally {
      setSidekickBusy(false);
    }
  };

  const openFocus = (taskId: string) => {
    nav(`/focus?target=${encodeURIComponent(taskId)}`);
  };

  const breakDownTask = (taskTitle: string) => {
    nav(`/magic-tasks?task=${encodeURIComponent(taskTitle)}`);
  };

  const doneForToday = data.doneForTodayAt?.slice(0, 10) === today;
  const clearProjectFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("project");
    setSearchParams(next);
  };

  return (
    <div className="workspace-shell">
      <section className="workspace-hero panel stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="stack" style={{ gap: 8, minWidth: 260, flex: 1 }}>
            <div className="badge">{mode === "today" ? "Today" : "Planner"}</div>
            <h2 className="workspace-title">
              {mode === "today"
                ? "One clear list. One real next step."
                : projectFilter
                  ? `${projectFilter}, but in your actual brain language.`
                  : "TickTick cadence, Divergify brain model."}
            </h2>
            <p className="p">
              {mode === "today"
                ? "Tasks stay visible, support adapts to your current state, and the extra Divergify tools stay one tap away."
                : projectFilter
                  ? `This lane is filtered to ${projectFilter}. Clear the queue without losing the rest of the system.`
                  : "Sort the work, keep the pressure visible, and open support only when it helps the task move."}
            </p>
          </div>

          <div className="hero-actions">
            <button className={`btn ${checkInRequired ? "primary" : ""}`} onClick={onOpenCheckIn}>
              {checkInRequired ? "Run check-in" : `State: ${supportProfile.label}`}
            </button>
            <Link to="/brain-dump" className="btn" style={{ textDecoration: "none" }}>
              Brain dump
            </Link>
            <button className="btn" onClick={() => void askSidekick(selectedTask ?? anchorTask ?? null)} disabled={sidekickBusy}>
              {sidekickBusy ? `${sidekick.name}...` : `Ask ${sidekick.name}`}
            </button>
            {mode === "today" ? (
              <button
                className={`btn ${doneForToday ? "" : "primary"}`}
                onClick={() => {
                  actions.setDoneForToday(new Date().toISOString());
                  nav("/done");
                }}
              >
                {doneForToday ? "Already wrapped" : "Done for today"}
              </button>
            ) : null}
          </div>
        </div>

        <div className="metric-strip">
          <div className="metric-card">
            <span className="metric-label">Open</span>
            <strong>{openTasks.length}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Due now</span>
            <strong>{overdue.length + dueToday.length}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Habits hit</span>
            <strong>{habitsDoneToday}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Focus runs</span>
            <strong>{focusTodayCount}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Cap today</span>
            <strong>{dailyCap}</strong>
          </div>
        </div>

        <div className="hero-signal-grid">
          <article className="signal-card">
            <span className="metric-label">Anchor</span>
            <strong>{anchorTask?.title ?? "Pick one anchor task"}</strong>
            <span className="mini">
              {anchorTask
                ? "Keep one task obvious enough that re-entry stays cheap."
                : "One clear anchor keeps the rest of the list from competing for attention."}
            </span>
          </article>
          <article className="signal-card">
            <span className="metric-label">Support mode</span>
            <strong>{supportProfile.label}</strong>
            <span className="mini">Check-ins tune pacing, sprint length, and how much the app breaks work into smaller starts.</span>
          </article>
          <article className="signal-card">
            <span className="metric-label">Guide</span>
            <strong>{sidekick.name}</strong>
            <span className="mini">{sidekick.tagline}</span>
          </article>
          <article className="signal-card">
            <span className="metric-label">Mode</span>
            <strong>{data.preferences.tinFoil ? "Tinfoil Hat on" : "Cloud assist available"}</strong>
            <span className="mini">
              {data.preferences.tinFoil
                ? "Cloud assist is blocked. Planner tools and sidekicks stay local."
                : "Turn on Tinfoil Hat anytime if you want this session to stay strictly local."}
            </span>
          </article>
        </div>

        <div className="quick-add">
          <div className="quick-add-main">
            <input
              className="input quick-add-input"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={mode === "today" ? "Add an anchor, errand, or re-entry step" : "Add a task to the planner"}
              onKeyDown={(event) => {
                if (event.key === "Enter") addTask();
              }}
            />
            <button className="btn primary" onClick={addTask}>
              Add task
            </button>
          </div>

          <div className="quick-add-controls">
            <div className="field">
              <label className="label" htmlFor={`project-${mode}`}>Project</label>
              <input
                id={`project-${mode}`}
                className="input"
                value={project}
                list={`projects-${mode}`}
                onChange={(event) => setProject(event.target.value)}
              />
              <datalist id={`projects-${mode}`}>
                {projectOptions.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </div>

            <div className="field">
              <label className="label" htmlFor={`due-${mode}`}>Due</label>
              <input
                id={`due-${mode}`}
                className="input"
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
              />
            </div>

            <div className="field">
              <label className="label" htmlFor={`priority-${mode}`}>Priority</label>
              <select
                id={`priority-${mode}`}
                className="select"
                value={priority}
                onChange={(event) => setPriority(Number(event.target.value) as TaskPriority)}
              >
                {PRIORITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="task-chip-row">
            <button className="btn" onClick={() => setDueDate(today)}>Today</button>
            <button className="btn" onClick={() => setDueDate(addDays(today, 1))}>Tomorrow</button>
            <button className="btn" onClick={() => setDueDate("")}>Inbox</button>
            {!openTasks.length ? <button className="btn" onClick={seedStarterTasks}>Seed starter list</button> : null}
          </div>
        </div>
      </section>

      {mode === "today" ? (
        <div className="dashboard-grid">
          <div className="stack">
            <TaskSection
              badge="Due now"
              title="Anchor and due-now tasks"
              emptyCopy="Nothing is due right now. Protect that breathing room."
              tasks={readyNow}
              today={today}
              selectedTaskId={selectedTaskId}
              onSelect={setSelectedTaskId}
              onToggleDone={actions.toggleTaskDone}
              footer={
                <div className="row" style={{ flexWrap: "wrap" }}>
                  <Link to="/tasks" className="btn" style={{ textDecoration: "none" }}>
                    Open full planner
                  </Link>
                  <Link to="/calendar" className="btn" style={{ textDecoration: "none" }}>
                    Calendar board
                  </Link>
                </div>
              }
            />

            <TaskSection
              badge="Inbox"
              title="Unscheduled tasks"
              emptyCopy="Inbox is clear. That is a feature, not a bug."
              tasks={inbox.slice(0, 8)}
              today={today}
              selectedTaskId={selectedTaskId}
              onSelect={setSelectedTaskId}
              onToggleDone={actions.toggleTaskDone}
            />

            <TaskSection
              badge="Later this week"
              title="Upcoming"
              emptyCopy="Nothing scheduled in the next seven days."
              tasks={upcoming.slice(0, 8)}
              today={today}
              selectedTaskId={selectedTaskId}
              onSelect={setSelectedTaskId}
              onToggleDone={actions.toggleTaskDone}
            />

            <TaskSection
              badge="Parking lot"
              title="Later / someday"
              emptyCopy="No long-tail tasks waiting in the parking lot."
              tasks={later.slice(0, 8)}
              today={today}
              selectedTaskId={selectedTaskId}
              onSelect={setSelectedTaskId}
              onToggleDone={actions.toggleTaskDone}
            />
          </div>

          <div className="stack">
            <TaskDetail
              mode={mode}
              task={selectedTask}
              anchorTask={anchorTask ?? null}
              today={today}
              projectOptions={projectOptions}
              onSelectTask={setSelectedTaskId}
              onToggleDone={actions.toggleTaskDone}
              onDelete={actions.deleteTask}
              onOpenFocus={openFocus}
              onBreakDown={breakDownTask}
              onAskSidekick={askSidekick}
              sidekickBusy={sidekickBusy}
            />

            {selectedTask ? <TaskChecklistEditor task={selectedTask} /> : null}

            <section className="widget-grid">
              <article className="workspace-card stack">
                <div className="badge">State sync</div>
                <h3 className="h2">{checkInRequired ? "Check-in is due." : supportProfile.label}</h3>
                <p className="p">
                  {checkInRequired
                    ? "Run the stimulation check so Divergify matches the day you have, not the fantasy version."
                    : `${supportProfile.label} is active. Suggested sprint is ${supportProfile.focusMinutesDefault} minutes, daily cap is ${dailyCap} core task${dailyCap === 1 ? "" : "s"}, and nudges run every ${supportProfile.nudgeIntervalSeconds < 60 ? `${supportProfile.nudgeIntervalSeconds} seconds` : `${supportProfile.nudgeIntervalSeconds / 60} minutes`}.`}
                </p>
                <button className={`btn ${checkInRequired ? "primary" : ""}`} onClick={onOpenCheckIn}>
                  {checkInRequired ? "Run check-in" : "Update state"}
                </button>
              </article>

              <article className="workspace-card stack">
                <div className="badge">Launch lane</div>
                <h3 className="h2">{anchorTask ? anchorTask.title : "No anchor picked yet"}</h3>
                <p className="p">
                  {anchorTask
                    ? "Start the sprint, or break the task down before the friction turns into avoidance."
                    : "Pick one task that would make today feel more coherent."}
                </p>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  {anchorTask ? (
                    <button className="btn primary" onClick={() => openFocus(anchorTask.id)}>
                      Focus on anchor
                    </button>
                  ) : (
                    <Link to="/tasks" className="btn primary" style={{ textDecoration: "none" }}>
                      Open planner
                    </Link>
                  )}
                  {anchorTask ? <button className="btn" onClick={() => breakDownTask(anchorTask.title)}>Break it down</button> : null}
                </div>
              </article>

              <article className="workspace-card stack">
                <div className="badge">Rhythm</div>
                <h3 className="h2">{habitsDoneToday}/{data.habits.length} habits checked</h3>
                <p className="p">{focusTodayCount} focus sprint{focusTodayCount === 1 ? "" : "s"} logged today.</p>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  <Link to="/habits" className="btn" style={{ textDecoration: "none" }}>
                    Habits
                  </Link>
                  <Link to="/focus" className="btn" style={{ textDecoration: "none" }}>
                    Focus
                  </Link>
                </div>
              </article>

              <article className="workspace-card stack">
                <div className="badge">Support</div>
                <h3 className="h2">{sidekick.name}</h3>
                <p className="p">
                  Keep the sidekick close for breakdowns, re-entry steps, and loop guards without turning the product
                  into a distraction.
                </p>
                <button className="btn" onClick={() => askSidekick(selectedTask ?? anchorTask ?? null)}>
                  Open sidekick
                </button>
              </article>
            </section>
          </div>
        </div>
      ) : (
        <div className="planner-grid">
          <section className="workspace-card stack">
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="badge">Views</div>
                <h3 className="h2">Planner filters</h3>
              </div>
              <span className="badge">{visiblePlannerTasks.length}</span>
            </div>

            <div className="view-bar">
              {VIEW_ORDER.map((option) => (
                <button
                  key={option}
                  className={`btn ${view === option ? "primary" : ""}`}
                  onClick={() => setView(option)}
                >
                  {option[0].toUpperCase() + option.slice(1)} ({viewCounts[option]})
                </button>
              ))}
            </div>

            {projectFilter ? (
              <div className="row" style={{ flexWrap: "wrap" }}>
                <span className="badge">Project: {projectFilter}</span>
                <button className="btn" onClick={clearProjectFilter}>
                  Show all projects
                </button>
              </div>
            ) : null}

            {visiblePlannerTasks.length === 0 ? (
              <div className="task-empty">
                {view === "done"
                  ? "Nothing completed yet. Close one loop and it will land here."
                  : projectFilter
                    ? `No tasks in ${projectFilter} for this view right now.`
                    : "No tasks in this view. That is allowed."}
              </div>
            ) : (
              <div className="task-list task-list-large">
                {visiblePlannerTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`task-row ${selectedTaskId === task.id ? "selected" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedTaskId(task.id)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedTaskId(task.id);
                      }
                    }}
                  >
                    <input
                      className="task-check"
                      type="checkbox"
                      checked={task.done}
                      onClick={(event) => event.stopPropagation()}
                      onChange={() => actions.toggleTaskDone(task.id)}
                    />
                    <div className="task-main">
                      <div className="task-title">{task.title}</div>
                      <div className="task-meta">
                        <span>{task.project}</span>
                        <span>{priorityLabel(task.priority)}</span>
                        {task.dueDate ? <span>{task.dueDate === today ? "Today" : task.dueDate}</span> : <span>Inbox</span>}
                        {task.recurrence !== "none" ? <span>{task.recurrence}</span> : null}
                        {task.estimateMinutes ? <span>{task.estimateMinutes}m</span> : null}
                        {task.checklist.length ? (
                          <span>
                            {checklistProgress(task).done}/{task.checklist.length} steps
                          </span>
                        ) : null}
                      </div>
                      {task.notes ? <div className="mini">{task.notes}</div> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="row" style={{ flexWrap: "wrap" }}>
              <Link to="/calendar" className="btn" style={{ textDecoration: "none" }}>
                Calendar board
              </Link>
              <Link to="/magic-tasks" className="btn" style={{ textDecoration: "none" }}>
                Magic Tasks
              </Link>
            </div>
          </section>

          <div className="stack">
            <TaskDetail
              mode={mode}
              task={selectedTask}
              anchorTask={anchorTask ?? null}
              today={today}
              projectOptions={projectOptions}
              onSelectTask={setSelectedTaskId}
              onToggleDone={actions.toggleTaskDone}
              onDelete={actions.deleteTask}
              onOpenFocus={openFocus}
              onBreakDown={breakDownTask}
              onAskSidekick={askSidekick}
              sidekickBusy={sidekickBusy}
            />

            {selectedTask ? <TaskChecklistEditor task={selectedTask} /> : null}

            <section className="widget-grid">
              <article className="workspace-card stack">
                <div className="badge">Pressure map</div>
                <h3 className="h2">{overdue.length + dueToday.length} due now</h3>
                <p className="p">
                  Keep the due-now pile under {dailyCap}. If it is higher, move lower-stakes work out of today before you ask for more willpower.
                </p>
              </article>

              <article className="workspace-card stack">
                <div className="badge">Divergify extras</div>
                <p className="p">
                  The list stays task-first, but focus sprints, habits, and guided breakdowns stay wired in so the
                  planner actually changes behavior.
                </p>
                <div className="row" style={{ flexWrap: "wrap" }}>
                  <Link to="/focus" className="btn" style={{ textDecoration: "none" }}>
                    Focus
                  </Link>
                  <Link to="/habits" className="btn" style={{ textDecoration: "none" }}>
                    Habits
                  </Link>
                  <button className="btn" onClick={() => askSidekick(selectedTask)}>
                    Sidekick
                  </button>
                </div>
              </article>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
