import { clampOverwhelm, mapOverwhelmToSupportLevel, type SupportLevel } from "../state/sessionState";

export type SupportProfile = {
  level: SupportLevel;
  label: string;
  rangeLabel: string;
  description: string;
  focusMinutesDefault: number;
  focusDurationOptions: number[];
  nudgeIntervalSeconds: number;
  dailyTaskCap: number;
  autoEnableShades: boolean;
  autoReduceMotion: boolean;
};

const SUPPORT_PROFILES: Record<SupportLevel, Omit<SupportProfile, "level">> = {
  normal: {
    label: "Baseline",
    rangeLabel: "0-24",
    description: "The lightest support setting with longer focus windows, slower nudges, and the widest daily task cap.",
    focusMinutesDefault: 20,
    focusDurationOptions: [15, 20, 25],
    nudgeIntervalSeconds: 180,
    dailyTaskCap: 7,
    autoEnableShades: false,
    autoReduceMotion: false
  },
  medium: {
    label: "Medium support",
    rangeLabel: "25-49",
    description: "A middle setting with a tighter daily cap, slightly shorter focus options, and steadier nudges.",
    focusMinutesDefault: 15,
    focusDurationOptions: [10, 15, 20, 25],
    nudgeIntervalSeconds: 150,
    dailyTaskCap: 5,
    autoEnableShades: false,
    autoReduceMotion: false
  },
  gentle: {
    label: "Gentle support",
    rangeLabel: "50-74",
    description: "Shorter sprints, more frequent nudges, and a lower task cap when the day is louder than usual.",
    focusMinutesDefault: 10,
    focusDurationOptions: [5, 10, 15, 25],
    nudgeIntervalSeconds: 120,
    dailyTaskCap: 3,
    autoEnableShades: false,
    autoReduceMotion: false
  },
  overloaded: {
    label: "High support",
    rangeLabel: "75-100",
    description: "Very small starts, the shortest focus options, faster nudges, and auto-calmer presentation.",
    focusMinutesDefault: 5,
    focusDurationOptions: [5, 10, 15],
    nudgeIntervalSeconds: 75,
    dailyTaskCap: 2,
    autoEnableShades: true,
    autoReduceMotion: true
  }
};

export function formatNudgeCadence(seconds: number) {
  if (seconds < 60) return `every ${seconds} sec`;
  if (seconds % 60 === 0) return `every ${seconds / 60} min`;
  const minutes = Number((seconds / 60).toFixed(1));
  return `every ${minutes} min`;
}

export function getSupportScale(): SupportProfile[] {
  return (["normal", "medium", "gentle", "overloaded"] as const).map((level) => ({
    level,
    ...SUPPORT_PROFILES[level]
  }));
}

export function getSupportProfile(overwhelm: number | null | undefined): SupportProfile {
  const safeOverwhelm = clampOverwhelm(overwhelm ?? 50);
  const level = mapOverwhelmToSupportLevel(safeOverwhelm);
  return {
    level,
    ...SUPPORT_PROFILES[level]
  };
}
