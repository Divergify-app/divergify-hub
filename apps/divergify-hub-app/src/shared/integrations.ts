import type { Task } from "../state/types";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "divergify-task";
}

function parseIsoDate(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseLocalDateTime(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    Number(match[4]),
    Number(match[5]),
    0,
    0
  );
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number) {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateOnly(date: Date) {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
}

function formatUtcDateTime(date: Date) {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate())
  ].join("") + `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`;
}

function escapeIcsText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function externalOpen(url: string) {
  if (typeof window === "undefined") return;
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.assign(url);
  }
}

function buildTaskDetails(task: Task) {
  const details = [
    task.project ? `Project: ${task.project}` : "",
    task.notes?.trim() || "",
    "Created in Divergify"
  ]
    .filter(Boolean)
    .join("\n\n");
  return details || "Created in Divergify";
}

function taskStartDate(task: Task) {
  if (task.startAt) return parseLocalDateTime(task.startAt);
  return null;
}

function taskEndDate(task: Task) {
  const start = taskStartDate(task);
  if (!start) return null;
  return new Date(start.getTime() + Math.max(15, task.estimateMinutes ?? 30) * 60_000);
}

export function taskHasCalendarSchedule(task: Task) {
  return Boolean(task.startAt || task.dueDate);
}

export function getGoogleCalendarUrl(task: Task) {
  if (!taskHasCalendarSchedule(task)) return null;

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: task.title,
    details: buildTaskDetails(task)
  });

  if (task.location?.trim()) {
    params.set("location", task.location.trim());
  }

  const start = taskStartDate(task);
  const end = taskEndDate(task);
  if (start && end) {
    params.set("dates", `${formatUtcDateTime(start)}/${formatUtcDateTime(end)}`);
  } else if (task.dueDate) {
    const due = parseIsoDate(task.dueDate);
    if (!due) return null;
    params.set("dates", `${formatDateOnly(due)}/${formatDateOnly(addDays(due, 1))}`);
  } else {
    return null;
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function openGoogleCalendarForTask(task: Task) {
  const url = getGoogleCalendarUrl(task);
  if (!url) return false;
  externalOpen(url);
  return true;
}

export function downloadTaskIcs(task: Task) {
  if (!taskHasCalendarSchedule(task) || typeof document === "undefined") return false;

  const uid = `${slugify(task.title)}@divergify`;
  const stamp = formatUtcDateTime(new Date());
  const start = taskStartDate(task);
  const end = taskEndDate(task);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Divergify//Planner//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${escapeIcsText(task.title)}`
  ];

  if (start && end) {
    lines.push(`DTSTART:${formatUtcDateTime(start)}`);
    lines.push(`DTEND:${formatUtcDateTime(end)}`);
  } else if (task.dueDate) {
    const due = parseIsoDate(task.dueDate);
    if (!due) return false;
    lines.push(`DTSTART;VALUE=DATE:${formatDateOnly(due)}`);
    lines.push(`DTEND;VALUE=DATE:${formatDateOnly(addDays(due, 1))}`);
  } else {
    return false;
  }

  if (task.location?.trim()) {
    lines.push(`LOCATION:${escapeIcsText(task.location.trim())}`);
  }

  const details = buildTaskDetails(task);
  if (details) {
    lines.push(`DESCRIPTION:${escapeIcsText(details)}`);
  }

  lines.push("END:VEVENT", "END:VCALENDAR");

  const blob = new Blob([`${lines.join("\r\n")}\r\n`], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${slugify(task.title)}.ics`;
  anchor.click();
  URL.revokeObjectURL(url);
  return true;
}

export function getWazeUrl(task: Task) {
  const location = task.location?.trim();
  if (!location) return null;
  const params = new URLSearchParams({
    q: location,
    navigate: "yes"
  });
  return `https://www.waze.com/ul?${params.toString()}`;
}

export function openWazeForTask(task: Task) {
  const url = getWazeUrl(task);
  if (!url) return false;
  externalOpen(url);
  return true;
}

export function syncStartAtWithDueDate(startAt: string | undefined, dueDate: string | undefined) {
  if (!startAt || !dueDate) return startAt;
  const match = /^T(\d{2}:\d{2})$/.exec(startAt.slice(10));
  if (!match) return startAt;
  return `${dueDate}${match[0]}`;
}
