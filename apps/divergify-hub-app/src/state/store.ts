import type { AppData } from "./types";
import { nowIso, uid } from "../shared/utils";

const KEY = "divergify:app:v1";

export function defaultData(): AppData {
  return {
    version: 1,
    hasOnboarded: false,
    activeSidekickId: "takota",
    preferences: {
      humor: "light",
      fontScale: 1,
      reduceMotion: false,
      shades: false,
      lowStim: false,
      tinFoil: false,
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

export function loadData(): AppData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppData;
    if (!parsed || parsed.version !== 1) return null;
    parsed.preferences = {
      ...parsed.preferences,
      lowStim: Boolean(parsed.preferences?.lowStim)
    };
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
