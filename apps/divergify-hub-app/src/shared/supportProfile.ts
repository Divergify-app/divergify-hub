import { clampOverwhelm, mapOverwhelmToSupportLevel, type SupportLevel } from "../state/sessionState";

export type SupportProfile = {
  level: SupportLevel;
  label: string;
  focusMinutesDefault: number;
  focusDurationOptions: number[];
  nudgeIntervalSeconds: number;
  autoEnableShades: boolean;
  autoReduceMotion: boolean;
};

export function getSupportProfile(overwhelm: number | null | undefined): SupportProfile {
  const safeOverwhelm = clampOverwhelm(overwhelm ?? 50);
  const level = mapOverwhelmToSupportLevel(safeOverwhelm);

  if (level === "overloaded") {
    return {
      level,
      label: "High support",
      focusMinutesDefault: 5,
      focusDurationOptions: [5, 10, 15],
      nudgeIntervalSeconds: 75,
      autoEnableShades: true,
      autoReduceMotion: true
    };
  }

  if (level === "gentle") {
    return {
      level,
      label: "Gentle support",
      focusMinutesDefault: 10,
      focusDurationOptions: [5, 10, 15, 25],
      nudgeIntervalSeconds: 120,
      autoEnableShades: false,
      autoReduceMotion: false
    };
  }

  return {
    level,
    label: "Baseline",
    focusMinutesDefault: 15,
    focusDurationOptions: [10, 15, 25],
    nudgeIntervalSeconds: 180,
    autoEnableShades: false,
    autoReduceMotion: false
  };
}
