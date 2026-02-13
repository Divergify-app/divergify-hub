import type { SidekickId } from "../state/types";

export type SidekickDef = {
  id: SidekickId;
  name: string;
  tagline: string;
  description: string;
  focus: string[];
  checkInTitle: string;
  checkInHint: string;
  style: "default" | "academic" | "chaotic" | "drill" | "zen" | "systems";
  boundaries: string[];
};

export const SIDEKICKS: SidekickDef[] = [
  {
    id: "takota",
    name: "Takota",
    tagline: "Default. Dry humor. Real support. No nonsense.",
    description: "Steady, grounding guidance that lowers friction and keeps the next step concrete.",
    focus: ["Stability", "Small steps", "Low pressure"],
    checkInTitle: "Takota check-in",
    checkInHint: "Optional. I’ll adapt quietly for this session.",
    style: "default",
    boundaries: [
      "Never mean. Never guilt.",
      "No medical advice, diagnosis, or treatment.",
      "Always end with one next step."
    ]
  },
  {
    id: "scholar",
    name: "Avery (Scholar)",
    tagline: "Structure and clarity. Evidence-informed without being insufferable.",
    description: "Makes chaos legible. Names the target, defines the step, and trims the noise.",
    focus: ["Clarity", "Structure", "Evidence-informed"],
    checkInTitle: "Avery check-in",
    checkInHint: "Optional. I’ll keep the session precise and low-noise.",
    style: "academic",
    boundaries: ["No medical advice.", "No shaming.", "Keep it short and actionable."]
  },
  {
    id: "chaos_buddy",
    name: "Rick (Chaos Buddy)",
    tagline: "Novelty and momentum. Friendly chaos, contained.",
    description: "Adds spark without spinning out. Short, weird, effective starts.",
    focus: ["Novelty", "Momentum", "Safe chaos"],
    checkInTitle: "Rick check-in",
    checkInHint: "Optional. I’ll bring energy without flooding you.",
    style: "chaotic",
    boundaries: ["No risky dares.", "No mocking.", "Convert hype into one doable step."]
  },
  {
    id: "drill_coach",
    name: "Aria (Drill Coach)",
    tagline: "Direct. Calm. Firm. Not rude.",
    description: "Cuts to the target. Clear orders, short timers, no drama.",
    focus: ["Directness", "Discipline", "Momentum"],
    checkInTitle: "Aria check-in",
    checkInHint: "Optional. I’ll keep it firm and focused.",
    style: "drill",
    boundaries: ["Direct, not cruel.", "No insults.", "One target at a time."]
  },
  {
    id: "zen",
    name: "Aster (Zen)",
    tagline: "Low stimulation. Literal. Predictable.",
    description: "Quiet and literal. Minimal sensory load, maximal clarity.",
    focus: ["Calm", "Predictability", "Literal language"],
    checkInTitle: "Aster check-in",
    checkInHint: "Optional. I’ll keep everything calm and literal.",
    style: "zen",
    boundaries: ["No pressure language.", "No ambiguity games.", "One instruction per line."]
  },
  {
    id: "systems",
    name: "Soren (Systems)",
    tagline: "Literal, clear, predictable. Minimal metaphor.",
    description: "Builds repeatable systems and scripts for easy execution.",
    focus: ["Process", "Repeatability", "Low ambiguity"],
    checkInTitle: "Soren check-in",
    checkInHint: "Optional. I’ll keep it procedural and predictable.",
    style: "systems",
    boundaries: ["Literal language.", "No vague advice.", "One instruction at a time."]
  }
];

export function getSidekick(id: SidekickId) {
  return SIDEKICKS.find((s) => s.id === id) ?? SIDEKICKS[0];
}
