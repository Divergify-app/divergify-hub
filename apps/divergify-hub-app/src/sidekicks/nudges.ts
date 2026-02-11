import type { SupportLevel } from "../state/sessionState";
import type { SidekickId } from "../state/types";

const BASE_NUDGES: Record<SupportLevel, string[]> = {
  overloaded: [
    "One breath. One small action.",
    "Only this step exists right now.",
    "Half speed is still forward."
  ],
  gentle: [
    "Keep the scope tiny and steady.",
    "You are building momentum, not proving worth.",
    "Finish this step before choosing the next one."
  ],
  normal: [
    "Stay on target. Progress beats perfection.",
    "Ship this step, then reassess.",
    "Short sprint, clean finish."
  ]
};

function personaPrefix(sidekickId: SidekickId) {
  if (sidekickId === "scholar") return "Scholar nudge";
  if (sidekickId === "chaos_buddy") return "Chaos nudge";
  if (sidekickId === "drill_coach") return "Coach nudge";
  if (sidekickId === "zen") return "Zen nudge";
  if (sidekickId === "systems") return "Systems nudge";
  return "Takota nudge";
}

function personaFlavor(sidekickId: SidekickId) {
  if (sidekickId === "scholar") return "Define done in one line, then execute.";
  if (sidekickId === "chaos_buddy") return "If stuck, make the next step weirder and smaller.";
  if (sidekickId === "drill_coach") return "No side quests until this timer ends.";
  if (sidekickId === "zen") return "Quietly continue with the same small action.";
  if (sidekickId === "systems") return "Run the next system step exactly once.";
  return "Stay small, stay honest, keep moving.";
}

export function buildFocusNudges(sidekickId: SidekickId, supportLevel: SupportLevel, targetLabel: string) {
  const base = BASE_NUDGES[supportLevel];
  const target = targetLabel.trim() ? `Target: ${targetLabel}.` : "";
  return [
    `${personaPrefix(sidekickId)}: ${personaFlavor(sidekickId)} ${target}`.trim(),
    ...base.map((line) => `${personaPrefix(sidekickId)}: ${line}`)
  ];
}
