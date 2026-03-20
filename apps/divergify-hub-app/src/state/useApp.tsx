import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type {
  AppData,
  ChatTurn,
  FocusSession,
  Habit,
  OnboardingProfile,
  Preferences,
  SidekickId,
  Task,
  TaskPriority,
  TaskRecurrence
} from "./types";
import { defaultData, loadData, saveData } from "./store";
import { clamp, nowIso, todayISO, uid } from "../shared/utils";
import { nextDueDateForRecurrence } from "../shared/tasks";

type Actions = {
  setHasOnboarded: (v: boolean) => void;
  setHasCompletedKickoff: (v: boolean) => void;
  setActiveSidekickId: (id: SidekickId) => void;
  setOnboardingProfile: (p: OnboardingProfile | null) => void;

  setPreferences: (p: Preferences) => void;
  toggleShades: () => void;
  toggleLowStim: () => void;
  toggleTinFoil: () => void;

  addTask: (t: {
    title: string;
    notes?: string;
    dueDate?: string;
    startAt?: string;
    location?: string;
    tags?: string[];
    project?: string;
    priority?: TaskPriority;
    recurrence?: TaskRecurrence;
    estimateMinutes?: number;
  }) => string | null;
  updateTask: (id: string, patch: Partial<Omit<Task, "id">>) => void;
  addTaskChecklistItem: (taskId: string, text: string) => void;
  toggleTaskChecklistItem: (taskId: string, itemId: string) => void;
  updateTaskChecklistItem: (taskId: string, itemId: string, text: string) => void;
  deleteTaskChecklistItem: (taskId: string, itemId: string) => void;
  toggleTaskDone: (id: string) => void;
  deleteTask: (id: string) => void;

  addHabit: (h: { name: string; cue?: string; tinyVersion?: string; frequency?: "daily" | "weekly" }) => void;
  toggleHabitCheckinToday: (id: string) => void;
  deleteHabit: (id: string) => void;

  addFocusSession: (s: Omit<FocusSession, "id">) => void;

  pushChat: (turn: ChatTurn) => void;
  clearChat: () => void;

  setDoneForToday: (at: string | null) => void;

  setSidekickDrawerOpen: (open: boolean) => void;

  exportData: () => AppData;
  importData: (data: AppData) => void;
  resetAll: () => void;
};

type Ctx = { hydrated: boolean; data: AppData; actions: Actions };

const AppCtx = createContext<Ctx | null>(null);

function applyDomPrefs(p: Preferences) {
  const root = document.documentElement;
  root.style.setProperty("--scale", String(p.fontScale ?? 1));
  root.dataset.mode = p.shades ? "shades" : "default";
  root.dataset.privacy = p.tinFoil ? "tinfoil" : "off";

  const motionReduced = p.reduceMotion || p.shades;
  root.dataset.motion = motionReduced ? "reduced" : "normal";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<AppData>(() => defaultData());

  useEffect(() => {
    const loaded = loadData();
    if (loaded) setData(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    applyDomPrefs(data.preferences);
  }, [data.preferences]);

  useEffect(() => {
    document.body.classList.toggle("low-stim", Boolean(data.preferences.lowStim));
    document.body.classList.toggle("tin-foil", Boolean(data.preferences.tinFoil));
    return () => {
      document.body.classList.remove("low-stim");
      document.body.classList.remove("tin-foil");
    };
  }, [data.preferences.lowStim, data.preferences.tinFoil]);

  const timer = useRef<number | null>(null);
  useEffect(() => {
    if (!hydrated) return;
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => saveData(data), 300);
  }, [data, hydrated]);

  const actions: Actions = useMemo(() => {
    return {
      setHasOnboarded: (v) => setData((d) => ({ ...d, hasOnboarded: v })),
      setHasCompletedKickoff: (v) => setData((d) => ({ ...d, hasCompletedKickoff: v })),

      setActiveSidekickId: (id) => setData((d) => ({ ...d, activeSidekickId: id })),
      setOnboardingProfile: (p) => setData((d) => ({ ...d, onboardingProfile: p })),

      setPreferences: (p) =>
        setData((d) => ({
          ...d,
          preferences: {
            ...p,
            fontScale: clamp(p.fontScale ?? 1, 0.9, 1.25)
          }
        })),

      toggleShades: () =>
        setData((d) => ({
          ...d,
          preferences: { ...d.preferences, shades: !d.preferences.shades }
        })),

      toggleLowStim: () =>
        setData((d) => ({
          ...d,
          preferences: { ...d.preferences, lowStim: !d.preferences.lowStim }
        })),

      toggleTinFoil: () =>
        setData((d) => ({
          ...d,
          preferences: { ...d.preferences, tinFoil: !d.preferences.tinFoil }
        })),

      addTask: ({ title, notes, dueDate, startAt, location, tags, project, priority, recurrence, estimateMinutes }) => {
        const t: Task = {
          id: uid(),
          title: title.trim(),
          notes: notes?.trim() || undefined,
          dueDate: dueDate || undefined,
          startAt: startAt || undefined,
          location: location?.trim() || undefined,
          project: project?.trim() || "Inbox",
          priority: priority ?? 3,
          recurrence: recurrence ?? "none",
          estimateMinutes:
            typeof estimateMinutes === "number" && Number.isFinite(estimateMinutes) && estimateMinutes > 0
              ? Math.round(estimateMinutes)
              : undefined,
          tags: (tags ?? []).map((x) => x.trim()).filter(Boolean),
          checklist: [],
          done: false,
          completedAt: undefined,
          createdAt: nowIso(),
          updatedAt: nowIso()
        };
        if (!t.title) return null;
        setData((d) => ({ ...d, tasks: [t, ...d.tasks] }));
        return t.id;
      },

      updateTask: (id, patch) => {
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((t) => (t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t))
        }));
      },

      addTaskChecklistItem: (taskId, text) => {
        const cleanText = text.trim();
        if (!cleanText) return;
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: [...task.checklist, { id: uid(), text: cleanText, done: false }],
                  updatedAt: nowIso()
                }
              : task
          )
        }));
      },

      toggleTaskChecklistItem: (taskId, itemId) => {
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: task.checklist.map((item) =>
                    item.id === itemId ? { ...item, done: !item.done } : item
                  ),
                  updatedAt: nowIso()
                }
              : task
          )
        }));
      },

      updateTaskChecklistItem: (taskId, itemId, text) => {
        const cleanText = text.trim();
        if (!cleanText) return;
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: task.checklist.map((item) =>
                    item.id === itemId ? { ...item, text: cleanText } : item
                  ),
                  updatedAt: nowIso()
                }
              : task
          )
        }));
      },

      deleteTaskChecklistItem: (taskId, itemId) => {
        setData((d) => ({
          ...d,
          tasks: d.tasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  checklist: task.checklist.filter((item) => item.id !== itemId),
                  updatedAt: nowIso()
                }
              : task
          )
        }));
      },

      toggleTaskDone: (id) => {
        setData((d) => {
          const now = nowIso();
          const next: Task[] = [];

          for (const task of d.tasks) {
            if (task.id !== id) {
              next.push(task);
              continue;
            }

            if (task.done) {
              next.push({ ...task, done: false, completedAt: undefined, updatedAt: now });
              continue;
            }

            const completed = { ...task, done: true, completedAt: now, updatedAt: now };
            next.push(completed);

            if (task.recurrence !== "none") {
              next.unshift({
                ...task,
                id: uid(),
                checklist: task.checklist.map((item) => ({ ...item, done: false })),
                done: false,
                completedAt: undefined,
                dueDate: nextDueDateForRecurrence(task.recurrence, task.dueDate, todayISO()),
                createdAt: now,
                updatedAt: now
              });
            }
          }

          return { ...d, tasks: next };
        });
      },

      deleteTask: (id) => setData((d) => ({ ...d, tasks: d.tasks.filter((t) => t.id !== id) })),

      addHabit: ({ name, cue, tinyVersion, frequency }) => {
        const h: Habit = {
          id: uid(),
          name: name.trim(),
          cue: cue?.trim() || undefined,
          tinyVersion: tinyVersion?.trim() || undefined,
          frequency: frequency ?? "daily",
          checkins: [],
          createdAt: nowIso(),
          updatedAt: nowIso()
        };
        if (!h.name) return;
        setData((d) => ({ ...d, habits: [h, ...d.habits] }));
      },

      toggleHabitCheckinToday: (id) => {
        const today = todayISO();
        setData((d) => ({
          ...d,
          habits: d.habits.map((h) => {
            if (h.id !== id) return h;
            const has = h.checkins.includes(today);
            const checkins = has ? h.checkins.filter((x) => x !== today) : [today, ...h.checkins];
            return { ...h, checkins, updatedAt: nowIso() };
          })
        }));
      },

      deleteHabit: (id) => setData((d) => ({ ...d, habits: d.habits.filter((h) => h.id !== id) })),

      addFocusSession: (s) => {
        const session: FocusSession = { id: uid(), ...s };
        setData((d) => ({ ...d, focus: [session, ...d.focus].slice(0, 120) }));
      },

      pushChat: (turn) => setData((d) => ({ ...d, chat: [...d.chat, turn].slice(-160) })),

      clearChat: () =>
        setData((d) => ({
          ...d,
          chat: [
            {
              id: uid(),
              role: "assistant",
              sidekickId: "takota",
              content: "Chat cleared. Tell me what you need in one sentence. We will not make it complicated.",
              ts: nowIso()
            }
          ]
        })),

      setDoneForToday: (at) => setData((d) => ({ ...d, doneForTodayAt: at })),

      setSidekickDrawerOpen: (open) => setData((d) => ({ ...d, ui: { ...d.ui, sidekickDrawerOpen: open } })),

      exportData: () => data,

      importData: (incoming) => {
        if (!incoming || (incoming as any).version !== 1) {
          alert("Import failed: file does not look like Divergify data.");
          return;
        }
        setData(incoming);
      },

      resetAll: () => setData(defaultData())
    };
  }, [data]);

  const value = useMemo(() => ({ hydrated, data, actions }), [hydrated, data, actions]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
