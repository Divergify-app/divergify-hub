import type { AppData, ChatTurn, SidekickId } from "../state/types";
import type { SupportLevel } from "../state/sessionState";
import { nowIso, todayISO, uid } from "../shared/utils";
import { getSidekick } from "./defs";

type Input = {
  sidekickId: SidekickId;
  message: string;
  data: AppData;
  supportLevel?: SupportLevel;
};

function containsAny(s: string, words: string[]) {
  const t = s.toLowerCase();
  return words.some((w) => t.includes(w));
}

function pickOne<T>(arr: T[]): T | null {
  return arr.length ? arr[0] : null;
}

function humorLine(h: "neutral" | "light" | "sarcastic_supportive") {
  if (h === "sarcastic_supportive") return "Your brain just tried to open 12 tabs. We are closing 11.";
  if (h === "light") return "We do this small. Small works.";
  return "";
}

function stepSeconds(level: SupportLevel) {
  if (level === "overloaded") return 30;
  if (level === "gentle") return 60;
  return 90;
}

function microStepPrompt(base: string, level: SupportLevel) {
  return `Next step (${stepSeconds(level)} seconds): ${base}`;
}

function stopPointLine(level: SupportLevel) {
  if (level === "overloaded") return "Stop point: when the timer ends, pause and breathe before deciding.";
  return `Stop point: when the ${stepSeconds(level)} seconds end, stop and decide.`;
}

function supportLead(level: SupportLevel) {
  if (level === "overloaded") return "Support mode: high. We go very small and very clear.";
  if (level === "gentle") return "Support mode: gentle. We keep this steady and low-noise.";
  return "Support mode: baseline. We can push a little harder.";
}

function safeDisclaimer() {
  return "Note: productivity support only. Not medical advice.";
}

function summarizeContext(data: AppData) {
  const openTasks = data.tasks.filter((t) => !t.done);
  const topTask = pickOne(openTasks);
  return {
    openCount: openTasks.length,
    topTask: topTask?.title ?? null,
    habits: data.habits.length
  };
}

function replyWrapUp(data: AppData, supportLevel: SupportLevel) {
  const today = todayISO();
  const openTasks = data.tasks.filter((t) => !t.done).length;
  const doneTasks = data.tasks.filter((t) => t.done).length;
  const checkedHabits = data.habits.filter((h) => h.checkins.includes(today)).length;
  const nextTask = data.tasks.find((t) => !t.done)?.title ?? "Choose one tiny task to start tomorrow.";

  return [
    supportLead(supportLevel),
    "",
    "Wrap-up summary (3 bullets):",
    `- Tasks: ${doneTasks} done, ${openTasks} open.`,
    `- Habits checked in today: ${checkedHabits}.`,
    `- Focus sessions logged: ${data.focus.length}.`,
    "",
    `Next micro-step: ${nextTask} (${stepSeconds(supportLevel)} seconds).`,
    "Stop point: close the app when that step is done.",
    safeDisclaimer()
  ].join("\n");
}

function replyTakota(message: string, data: AppData, supportLevel: SupportLevel) {
  const ctx = summarizeContext(data);
  const h = humorLine(data.preferences.humor);

  if (containsAny(message, ["overwhelm", "overwhelmed", "panic", "spinning", "too much", "cant", "can't"])) {
    return [
      supportLead(supportLevel),
      "",
      "Okay. We are not fixing your whole life today.",
      h ? h : "",
      "",
      "Pick one:",
      `- Option A: do the easiest ${stepSeconds(supportLevel)} seconds.`,
      "- Option B: do a setup step (open the doc, lay out tools, write the title).",
      "",
      ctx.topTask
        ? microStepPrompt(`Open \"${ctx.topTask}\" and do the first tiny action.`, supportLevel)
        : microStepPrompt("Open the thing and write one title line.", supportLevel),
      stopPointLine(supportLevel)
    ].filter(Boolean).join("\n");
  }

  if (containsAny(message, ["plan", "schedule", "organize", "priority", "priorities"])) {
    return [
      supportLead(supportLevel),
      "",
      "Plan, but make it usable.",
      "",
      "Two-step plan:",
      "1) Pick ONE outcome for the next 25 minutes.",
      "2) Pick ONE task that proves progress.",
      "",
      ctx.topTask ? `Suggested task: \"${ctx.topTask}\"` : "Suggested task: choose the smallest visible step.",
      "",
      microStepPrompt("Start one short focus sprint, then reassess.", supportLevel),
      stopPointLine(supportLevel)
    ].join("\n");
  }

  if (containsAny(message, ["habit", "routine", "consistent", "streak"])) {
    return [
      supportLead(supportLevel),
      "",
      "Habits are not a morality contest.",
      "",
      "Make it smaller until it is easy on a bad day.",
      "If you want, write a cue and a tiny version.",
      "",
      microStepPrompt("Add one habit: name it, then set a tiny version you could do immediately.", supportLevel),
      stopPointLine(supportLevel),
      safeDisclaimer()
    ].join("\n");
  }

  if (containsAny(message, ["focus", "timer", "pomodoro", "sprint"])) {
    return [
      supportLead(supportLevel),
      "",
      "We can do focus. We can also stop.",
      "",
      "Rule: one target, one timer, no side quests.",
      microStepPrompt("Go to Focus, pick a task, start one sprint.", supportLevel),
      "When the timer ends: mark progress, then decide whether to continue.",
      stopPointLine(supportLevel)
    ].join("\n");
  }

  return [
    supportLead(supportLevel),
    "",
    "What is the smallest thing you want done in the next 10 minutes?",
    h ? h : "",
    "",
    "If you do not know, pick one:",
    "- ship one tiny task",
    "- check in on one habit",
    "- run one short focus sprint",
    "",
    microStepPrompt("Choose the smallest option that still moves the needle.", supportLevel),
    stopPointLine(supportLevel)
  ].filter(Boolean).join("\n");
}

function replyScholar(message: string, data: AppData, supportLevel: SupportLevel) {
  const ctx = summarizeContext(data);
  const lines = [
    supportLead(supportLevel),
    "",
    "Lets reduce uncertainty.",
    "",
    "1) Define done in one line.",
    "2) Define the first observable step.",
    "3) Timebox it to one sprint.",
    "",
    ctx.topTask ? `If you want a default: start with \"${ctx.topTask}\".` : "If you want a default: start with the smallest visible task.",
    "",
    microStepPrompt("Write the done-definition as a single sentence. Then do the first step.", supportLevel),
    stopPointLine(supportLevel),
    safeDisclaimer()
  ];
  if (containsAny(message, ["research", "study", "learn", "read", "write"])) {
    lines.unshift("Academic mode: clear target, clear constraint, clear next action.");
  }
  return lines.join("\n");
}

function replyChaos(data: AppData, supportLevel: SupportLevel) {
  const ctx = summarizeContext(data);
  const intervalMinutes = supportLevel === "overloaded" ? 1 : 2;
  return [
    supportLead(supportLevel),
    "",
    "Okay. We need novelty, but controlled novelty.",
    "",
    "Pick one weird-but-safe trick:",
    `- Do it for ${intervalMinutes} minute${intervalMinutes === 1 ? "" : "s"} only. Then you can quit.`,
    "- Change the location. Same task, new spot.",
    "- Rename the task to something funnier and smaller.",
    "",
    ctx.topTask ? `Target suggestion: \"${ctx.topTask}\"` : "Target suggestion: pick the smallest visible step.",
    "",
    microStepPrompt(
      `Set a ${intervalMinutes}-minute timer and start. When it ends, decide if you want one more round.`,
      supportLevel
    ),
    stopPointLine(supportLevel)
  ].join("\n");
}

function replyDrill(data: AppData, supportLevel: SupportLevel) {
  const ctx = summarizeContext(data);
  return [
    supportLead(supportLevel),
    "",
    "Listen. One objective.",
    "",
    "Do this now:",
    "1) Choose ONE target task.",
    "2) Start one sprint.",
    "3) No side quests.",
    "",
    ctx.topTask ? `Target: \"${ctx.topTask}\"` : "Target: choose the smallest visible task.",
    "",
    "When time is up: write one line of what changed. Then stop or repeat.",
    stopPointLine(supportLevel)
  ].join("\n");
}

function replyZen(data: AppData, supportLevel: SupportLevel) {
  const ctx = summarizeContext(data);
  return [
    supportLead(supportLevel),
    "",
    "We will keep this calm and literal.",
    "",
    "Step 1: choose one task.",
    ctx.topTask ? `Suggestion: ${ctx.topTask}` : "Suggestion: choose the smallest visible task.",
    "",
    "Step 2: set a short timer.",
    "Step 3: do only the first step.",
    "",
    "If you feel stuck, reduce the step size by half.",
    stopPointLine(supportLevel),
    safeDisclaimer()
  ].join("\n");
}

function replySystems(data: AppData, supportLevel: SupportLevel) {
  const ctx = summarizeContext(data);
  return [
    supportLead(supportLevel),
    "",
    "Systems mode: literal and predictable.",
    "",
    "Answer these in order:",
    "1) What is the output?",
    "2) What is the smallest input?",
    "3) What is the first test?",
    "",
    ctx.topTask ? `Default task: \"${ctx.topTask}\"` : "Default task: the smallest visible task.",
    "",
    microStepPrompt("Write one sentence for the output. Then do input prep.", supportLevel),
    stopPointLine(supportLevel)
  ].join("\n");
}

export function generateSidekickTurn(input: Input): ChatTurn {
  const s = getSidekick(input.sidekickId);
  const msg = input.message.trim();
  const supportLevel = input.supportLevel ?? "normal";

  if (containsAny(msg, ["wrap up", "wrap-up", "exit", "done for today", "close the app"])) {
    return {
      id: uid(),
      role: "assistant",
      sidekickId: input.sidekickId,
      content: replyWrapUp(input.data, supportLevel),
      ts: nowIso()
    };
  }

  const content =
    s.id === "takota" ? replyTakota(msg, input.data, supportLevel) :
    s.id === "scholar" ? replyScholar(msg, input.data, supportLevel) :
    s.id === "chaos_buddy" ? replyChaos(input.data, supportLevel) :
    s.id === "drill_coach" ? replyDrill(input.data, supportLevel) :
    s.id === "zen" ? replyZen(input.data, supportLevel) :
    replySystems(input.data, supportLevel);

  return {
    id: uid(),
    role: "assistant",
    sidekickId: input.sidekickId,
    content,
    ts: nowIso()
  };
}
