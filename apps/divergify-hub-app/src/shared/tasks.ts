import type { Task, TaskPriority, TaskRecurrence } from "../state/types";
import { todayISO } from "./utils";

export type TaskView = "inbox" | "today" | "upcoming" | "overdue" | "all";

function parseIsoDate(dateIso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateIso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
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

export function nextDueDateForRecurrence(
  recurrence: TaskRecurrence,
  currentDueDate: string | undefined,
  baseDate: string = todayISO()
): string {
  const seed = currentDueDate ?? baseDate;
  if (recurrence === "none") return seed;
  if (recurrence === "daily") return addDays(seed, 1);
  if (recurrence === "weekly") return addDays(seed, 7);
  if (recurrence === "monthly") {
    const parsed = parseIsoDate(seed);
    if (!parsed) return seed;
    parsed.setMonth(parsed.getMonth() + 1);
    return toIsoDate(parsed);
  }

  // weekdays
  let next = addDays(seed, 1);
  let guard = 0;
  while (guard < 8) {
    const parsed = parseIsoDate(next);
    if (!parsed) return seed;
    const day = parsed.getDay();
    if (day >= 1 && day <= 5) return next;
    next = addDays(next, 1);
    guard += 1;
  }
  return next;
}

function dueSortValue(task: Task): number {
  if (!task.dueDate) return Number.MAX_SAFE_INTEGER;
  return Date.parse(`${task.dueDate}T12:00:00`);
}

export function sortOpenTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    const dueDiff = dueSortValue(a) - dueSortValue(b);
    if (dueDiff !== 0) return dueDiff;
    return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
  });
}

export function isOverdue(task: Task, today: string): boolean {
  const dueDate = task.dueDate;
  if (!dueDate) return false;
  return dueDate < today;
}

export function isToday(task: Task, today: string): boolean {
  return task.dueDate === today;
}

export function isUpcoming(task: Task, today: string, horizonDays = 7): boolean {
  if (!task.dueDate) return false;
  if (task.dueDate <= today) return false;
  const max = addDays(today, horizonDays);
  return task.dueDate <= max;
}

export function filterTasksByView(tasks: Task[], view: TaskView, today: string): Task[] {
  if (view === "all") return tasks;
  if (view === "inbox") return tasks.filter((task) => !task.dueDate);
  if (view === "today") return tasks.filter((task) => isToday(task, today));
  if (view === "upcoming") return tasks.filter((task) => isUpcoming(task, today));
  return tasks.filter((task) => isOverdue(task, today));
}

export function countByView(tasks: Task[], today: string) {
  return {
    inbox: tasks.filter((task) => !task.dueDate).length,
    today: tasks.filter((task) => isToday(task, today)).length,
    upcoming: tasks.filter((task) => isUpcoming(task, today)).length,
    overdue: tasks.filter((task) => isOverdue(task, today)).length,
    all: tasks.length
  };
}

export function recommendedDailyTaskCap(overwhelm: number): number {
  if (overwhelm >= 75) return 2;
  if (overwhelm >= 50) return 3;
  if (overwhelm >= 25) return 5;
  return 7;
}

export function pickAnchorTask(tasks: Task[], today: string): Task | null {
  const ordered = sortOpenTasks(tasks);
  const overdue = ordered.find((task) => isOverdue(task, today));
  if (overdue) return overdue;
  const dueToday = ordered.find((task) => isToday(task, today));
  if (dueToday) return dueToday;
  return ordered[0] ?? null;
}

export function priorityLabel(priority: TaskPriority): string {
  if (priority === 1) return "P1";
  if (priority === 2) return "P2";
  if (priority === 3) return "P3";
  return "P4";
}

export function checklistProgress(task: Task) {
  const total = task.checklist.length;
  const done = task.checklist.filter((item) => item.done).length;
  return { done, total };
}
