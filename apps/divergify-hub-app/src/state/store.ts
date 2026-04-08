import type { AppData, Task, TaskChecklistItem, TaskPriority, TaskRecurrence } from "./types";
import { nowIso, uid } from "../shared/utils";

const KEY = "divergify:app:v1";

export function defaultData(): AppData {
  return {
    version: 1,
    hasOnboarded: false,
    hasCompletedKickoff: false,
    activeSidekickId: "takota",
    onboardingProfile: null,
    preferences: {
      humor: "light",
      fontScale: 1,
      reduceMotion: false,
      shades: false,
      lowStim: false,
      tinFoil: false,
      systems: false,
      loopGuard: { enabled: true, softLimitPerHour: 18, cooldownMinutes: 2 }
    },
    tasks: [],
    habits: [],
    focus: [],
    chat: [
      {
        id: uid(),
        role: "assistant",
        sidekickId: "takota",
        content:
          "I am Takota. Default settings: helpful, not precious.\n\nIf your brain is loud, we will work smaller. If your brain is bored, we will work weirder.\n\nPick one next step and we will build the bridge.",
        ts: nowIso()
      }
    ],
    doneForTodayAt: null,
    ui: { sidekickDrawerOpen: false }
  };
}

function normalizePriority(value: unknown): TaskPriority {
  if (value === 1 || value === 2 || value === 3 || value === 4) return value;
  return 3;
}

function normalizeRecurrence(value: unknown): TaskRecurrence {
  if (value === "daily" || value === "weekdays" || value === "weekly" || value === "monthly" || value === "none") {
    return value;
  }
  return "none";
}

function normalizeTask(value: unknown): Task | null {
  if (!value || typeof value !== "object") return null;
  const task = value as Partial<Task>;
  if (!task.id || !task.title) return null;
  const checklist = Array.isArray(task.checklist)
    ? task.checklist
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const candidate = item as Partial<TaskChecklistItem>;
          if (!candidate.id || !candidate.text) return null;
          return {
            id: String(candidate.id),
            text: String(candidate.text).trim(),
            done: Boolean(candidate.done)
          };
        })
        .filter((item): item is TaskChecklistItem => item !== null && Boolean(item.text))
        .slice(0, 32)
    : [];
  return {
    id: task.id,
    title: task.title,
    notes: task.notes?.trim() || undefined,
    dueDate: task.dueDate || undefined,
    startAt: typeof task.startAt === "string" ? task.startAt : undefined,
    location: task.location?.trim() || undefined,
    project: task.project?.trim() || "Inbox",
    priority: normalizePriority(task.priority),
    recurrence: normalizeRecurrence(task.recurrence),
    estimateMinutes:
      typeof task.estimateMinutes === "number" && Number.isFinite(task.estimateMinutes) && task.estimateMinutes > 0
        ? Math.round(task.estimateMinutes)
        : undefined,
    tags: Array.isArray(task.tags) ? task.tags.map((tag) => String(tag).trim()).filter(Boolean).slice(0, 10) : [],
    checklist,
    done: Boolean(task.done),
    completedAt: task.completedAt || undefined,
    createdAt: task.createdAt || nowIso(),
    updatedAt: task.updatedAt || nowIso()
  };
}

export function loadData(): AppData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed || parsed.version !== 1) return null;
    parsed.tasks = Array.isArray(parsed.tasks)
      ? parsed.tasks
          .map((task) => normalizeTask(task))
          .filter((task): task is Task => task !== null)
      : [];
    parsed.preferences = {
      ...parsed.preferences,
      lowStim: Boolean(parsed.preferences?.lowStim),
      systems: Boolean(parsed.preferences?.systems)
    };
    parsed.hasCompletedKickoff = parsed.hasOnboarded
      ? true
      : Boolean((parsed as Partial<AppData>).hasCompletedKickoff);
    parsed.onboardingProfile =
      parsed.onboardingProfile && typeof parsed.onboardingProfile === "object"
        ? {
            reason: String((parsed.onboardingProfile as any).reason ?? ""),
            primaryGoal: String((parsed.onboardingProfile as any).primaryGoal ?? ""),
            focusArea: String((parsed.onboardingProfile as any).focusArea ?? ""),
            anchorTask: String((parsed.onboardingProfile as any).anchorTask ?? ""),
            stimulationLevel: Number((parsed.onboardingProfile as any).stimulationLevel ?? 50),
            selectedTemplateId:
              typeof (parsed.onboardingProfile as any).selectedTemplateId === "string"
                ? (parsed.onboardingProfile as any).selectedTemplateId
                : null,
            createdAt: String((parsed.onboardingProfile as any).createdAt ?? nowIso())
          }
        : null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveData(data: AppData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // ignore storage errors
  }
}
