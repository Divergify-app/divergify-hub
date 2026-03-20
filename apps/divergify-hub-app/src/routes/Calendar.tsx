import { useMemo, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import type { Task } from "../state/types";
import { useApp } from "../state/useApp";
import { getGoogleCalendarUrl, getWazeUrl, openGoogleCalendarForTask, openWazeForTask } from "../shared/integrations";
import { priorityLabel, sortOpenTasks } from "../shared/tasks";
import { todayISO } from "../shared/utils";

type BoardMode = "day" | "week";

const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
const MONTH_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] as const;

function parseIsoDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(dateIso: string, days: number): string {
  const parsed = parseIsoDate(dateIso);
  if (!parsed) return dateIso;
  parsed.setDate(parsed.getDate() + days);
  return toIsoDate(parsed);
}

function startOfWeek(dateIso: string): string {
  const parsed = parseIsoDate(dateIso);
  if (!parsed) return dateIso;
  const day = parsed.getDay();
  const shift = day === 0 ? -6 : 1 - day;
  parsed.setDate(parsed.getDate() + shift);
  return toIsoDate(parsed);
}

function weekDays(dateIso: string): string[] {
  const start = startOfWeek(dateIso);
  return Array.from({ length: 7 }, (_, index) => addDays(start, index));
}

function shortDayLabel(dateIso: string): string {
  const parsed = parseIsoDate(dateIso);
  if (!parsed) return dateIso;
  return `${WEEKDAY_SHORT[parsed.getDay()]} ${MONTH_SHORT[parsed.getMonth()]} ${parsed.getDate()}`;
}

function longDayLabel(dateIso: string): string {
  const parsed = parseIsoDate(dateIso);
  if (!parsed) return dateIso;
  return `${WEEKDAY_SHORT[parsed.getDay()]} ${MONTH_SHORT[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`;
}

function TaskCard(props: {
  task: Task;
  today: string;
  onDragStart: (event: DragEvent<HTMLDivElement>) => void;
  onDragEnd: () => void;
  extra?: React.ReactNode;
}) {
  const { task, today, onDragStart, onDragEnd, extra } = props;
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="stack"
      style={{
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: 10,
        background: "rgba(255, 255, 255, 0.02)"
      }}
    >
      <div style={{ fontWeight: 600 }}>{task.title}</div>
      <div className="mini">
        {task.project} • {priorityLabel(task.priority)}
        {task.estimateMinutes ? ` • ${task.estimateMinutes}m` : ""}
        {task.recurrence !== "none" ? ` • ${task.recurrence}` : ""}
        {task.dueDate ? ` • Due ${task.dueDate === today ? "today" : task.dueDate}` : " • Unscheduled"}
      </div>
      {extra ?? null}
    </div>
  );
}

function IntegrationButtons({ task }: { task: Task }) {
  const calendarUrl = getGoogleCalendarUrl(task);
  const wazeUrl = getWazeUrl(task);

  if (!calendarUrl && !wazeUrl) return null;

  return (
    <>
      {calendarUrl ? (
        <button className="btn" onClick={() => openGoogleCalendarForTask(task)}>
          Google Calendar
        </button>
      ) : null}
      {wazeUrl ? (
        <button className="btn" onClick={() => openWazeForTask(task)}>
          Waze
        </button>
      ) : null}
    </>
  );
}

export function Calendar() {
  const { data, actions } = useApp();
  const today = todayISO();
  const [mode, setMode] = useState<BoardMode>("week");
  const [cursor, setCursor] = useState(today);
  const [dragTaskId, setDragTaskId] = useState<string | null>(null);
  const [dropTargetDate, setDropTargetDate] = useState<string | null>(null);

  const openTasks = useMemo(() => sortOpenTasks(data.tasks.filter((task) => !task.done)), [data.tasks]);
  const boardDays = useMemo(() => (mode === "day" ? [cursor] : weekDays(cursor)), [cursor, mode]);
  const daySet = useMemo(() => new Set(boardDays), [boardDays]);

  const unscheduled = useMemo(() => openTasks.filter((task) => !task.dueDate), [openTasks]);
  const outsideBoard = useMemo(
    () => openTasks.filter((task) => task.dueDate && !daySet.has(task.dueDate)),
    [daySet, openTasks]
  );

  const tasksByDate = useMemo(() => {
    const map: Record<string, Task[]> = {};
    for (const date of boardDays) map[date] = [];
    for (const task of openTasks) {
      if (task.dueDate && map[task.dueDate]) map[task.dueDate].push(task);
    }
    return map;
  }, [boardDays, openTasks]);

  const rangeLabel =
    mode === "day"
      ? longDayLabel(boardDays[0] ?? cursor)
      : `${shortDayLabel(boardDays[0] ?? cursor)} - ${shortDayLabel(boardDays[6] ?? cursor)}`;

  const shift = (direction: -1 | 1) => {
    const jump = mode === "day" ? 1 : 7;
    setCursor((prev) => addDays(prev, direction * jump));
  };

  const beginDrag = (taskId: string, event: DragEvent<HTMLDivElement>) => {
    setDragTaskId(taskId);
    event.dataTransfer.setData("text/task-id", taskId);
    event.dataTransfer.effectAllowed = "move";
  };

  const dropToDate = (dateIso: string, event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/task-id") || dragTaskId;
    if (!taskId) return;
    actions.updateTask(taskId, { dueDate: dateIso });
    setDropTargetDate(null);
    setDragTaskId(null);
  };

  const dropToInbox = (event: DragEvent<HTMLElement>) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData("text/task-id") || dragTaskId;
    if (!taskId) return;
    actions.updateTask(taskId, { dueDate: undefined });
    setDragTaskId(null);
  };

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Calendar Board</div>
        <h2 className="h2">Day/week scheduling with drag drops</h2>
        <p className="p">
          Drag tasks onto a day column to reschedule due dates. Keep the board simple and keep the anchor visible.
        </p>

        <div className="row" style={{ flexWrap: "wrap", justifyContent: "space-between" }}>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className={`btn ${mode === "day" ? "primary" : ""}`} onClick={() => setMode("day")}>
              Day
            </button>
            <button className={`btn ${mode === "week" ? "primary" : ""}`} onClick={() => setMode("week")}>
              Week
            </button>
          </div>

          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={() => shift(-1)}>
              {mode === "day" ? "Prev day" : "Prev week"}
            </button>
            <button className="btn" onClick={() => setCursor(today)}>
              Today
            </button>
            <button className="btn" onClick={() => shift(1)}>
              {mode === "day" ? "Next day" : "Next week"}
            </button>
          </div>
        </div>

        <div className="notice">
          <strong>{rangeLabel}</strong> • {openTasks.length} open task{openTasks.length === 1 ? "" : "s"}
        </div>

        <div
          className="row"
          onDragOver={(event) => event.preventDefault()}
          onDrop={dropToInbox}
          style={{
            border: "1px dashed var(--border-strong)",
            borderRadius: 12,
            padding: "10px 12px",
            justifyContent: "space-between",
            flexWrap: "wrap"
          }}
        >
          <div className="mini">Drop here to remove due date</div>
          <span className="badge">Inbox</span>
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3 className="h2">Unscheduled</h3>
          <span className="badge">{unscheduled.length}</span>
        </div>
        {unscheduled.length === 0 ? (
          <p className="p">No inbox tasks waiting for a date.</p>
        ) : (
          <div className="stack">
            {unscheduled.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                today={today}
                onDragStart={(event) => beginDrag(task.id, event)}
                onDragEnd={() => setDragTaskId(null)}
                extra={
                  <div className="row" style={{ flexWrap: "wrap" }}>
                    <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: boardDays[0] })}>
                      Schedule to {shortDayLabel(boardDays[0] ?? today)}
                    </button>
                    <IntegrationButtons task={task} />
                  </div>
                }
              />
            ))}
          </div>
        )}
      </div>

      {outsideBoard.length > 0 ? (
        <div className="card stack">
          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <h3 className="h2">Outside current range</h3>
            <span className="badge">{outsideBoard.length}</span>
          </div>
          <p className="p">These tasks are scheduled, just not in this day/week window.</p>
          <div className="stack">
            {outsideBoard.slice(0, 10).map((task) => {
              if (!task.dueDate) return null;
              return (
                <TaskCard
                  key={task.id}
                  task={task}
                  today={today}
                  onDragStart={(event) => beginDrag(task.id, event)}
                  onDragEnd={() => setDragTaskId(null)}
                  extra={
                    <div className="row" style={{ flexWrap: "wrap" }}>
                      <button className="btn" onClick={() => setCursor(task.dueDate ?? today)}>
                        Jump to {task.dueDate}
                      </button>
                      <IntegrationButtons task={task} />
                    </div>
                  }
                />
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
          <h3 className="h2">{mode === "day" ? "Day board" : "Week board"}</h3>
          <span className="badge">{boardDays.length} column{boardDays.length === 1 ? "" : "s"}</span>
        </div>
        <div
          style={{
            display: "grid",
            gap: 12,
            gridTemplateColumns: mode === "day" ? "minmax(0, 1fr)" : "repeat(7, minmax(180px, 1fr))"
          }}
        >
          {boardDays.map((dateIso) => {
            const dayTasks = tasksByDate[dateIso] ?? [];
            const isToday = dateIso === today;
            const isDropTarget = dropTargetDate === dateIso;
            return (
              <section
                key={dateIso}
                className="stack"
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropTargetDate(dateIso);
                }}
                onDragLeave={() => setDropTargetDate(null)}
                onDrop={(event) => dropToDate(dateIso, event)}
                style={{
                  border: `1px solid ${isDropTarget ? "var(--accent)" : "var(--border)"}`,
                  borderRadius: 12,
                  padding: 10,
                  background: isToday ? "rgba(205, 169, 119, 0.08)" : "rgba(255, 255, 255, 0.01)",
                  minHeight: 160
                }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <strong>{shortDayLabel(dateIso)}</strong>
                  <span className="badge">{dayTasks.length}</span>
                </div>
                {isToday ? <div className="mini">Today</div> : null}
                {dayTasks.length === 0 ? (
                  <p className="mini">Drop tasks here</p>
                ) : (
                  <div className="stack">
                    {dayTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        today={today}
                        onDragStart={(event) => beginDrag(task.id, event)}
                        onDragEnd={() => setDragTaskId(null)}
                        extra={
                          <div className="row" style={{ flexWrap: "wrap" }}>
                            <button className="btn" onClick={() => actions.updateTask(task.id, { dueDate: undefined })}>
                              Unschedule
                            </button>
                            <IntegrationButtons task={task} />
                          </div>
                        }
                      />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </div>

      <div className="row" style={{ flexWrap: "wrap" }}>
        <Link to="/tasks" className="btn" style={{ textDecoration: "none" }}>
          Open planner list
        </Link>
        <Link to="/" className="btn" style={{ textDecoration: "none" }}>
          Back to today
        </Link>
      </div>
    </div>
  );
}
