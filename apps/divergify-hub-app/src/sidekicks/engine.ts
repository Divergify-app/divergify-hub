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
  if (h === "sarcastic_supportive") return "Your brain opened 12 tabs again. We are working with one.";
  if (h === "light") return "We do this small. Small works.";
  return "";
}

function stepSeconds(level: SupportLevel) {
  if (level === "overloaded") return 30;
  if (level === "medium") return 75;
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
  if (level === "medium") return "Support mode: medium. We tighten the scope and keep the pace steady.";
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
  const sarcasmAllowed = data.preferences.humor === "sarcastic_supportive";

  if (containsAny(message, ["overwhelm", "overwhelmed", "panic", "spinning", "too much", "cant", "can't"])) {
    return [
      supportLead(supportLevel),
      "",
      sarcasmAllowed ? "Okay. We are not solving your entire existence before lunch." : "Okay. We are not fixing your whole life today.",
      h || "",
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
      sarcasmAllowed ? "Plan, but an actual usable plan. Not a decorative fantasy spreadsheet." : "Plan, but make it usable.",
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
      sarcasmAllowed ? "Habits are not a morality contest. You do not get bonus points for suffering." : "Habits are not a morality contest.",
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
      sarcasmAllowed ? "We can do focus. We do not need to make it dramatic." : "We can do focus. We can also stop.",
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
    sarcasmAllowed
      ? "What is the smallest useful thing you can get done in the next 10 minutes, not the imaginary perfect version?"
      : "What is the smallest thing you want done in the next 10 minutes?",
    h || "",
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
  const intervalMinutes = supportLevel === "overloaded" ? 1 : supportLevel === "normal" ? 3 : 2;
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

function replySystems(message: string, data: AppData, supportLevel: SupportLevel) {
  const ctx = summarizeContext(data);
  const task = ctx.topTask ? `"${ctx.topTask}"` : "the first open task in your list";

  if (containsAny(message, ["overwhelm", "overwhelmed", "panic", "spinning", "too much", "cant", "can't", "stuck"])) {
    return [
      supportLead(supportLevel),
      "",
      "You said you are stuck or overwhelmed. Here is what to do.",
      "",
      "1. Stop what you are doing right now.",
      "2. Take one breath.",
      "3. Look at this task: " + task + ".",
      "4. Do only the first physical action for that task.",
      "   Example of a first physical action: open the document, write the title, pick up the item.",
      `5. Set a timer for ${stepSeconds(supportLevel)} seconds.`,
      "6. When the timer ends, stop. Decide then whether to continue.",
      "",
      "Stop point: when the timer ends, you are allowed to stop.",
      safeDisclaimer()
    ].join("\n");
  }

  if (containsAny(message, ["plan", "schedule", "organize", "priority", "priorities", "what do i do", "what should i"])) {
    return [
      supportLead(supportLevel),
      "",
      "Here is a plan. Do each step in order.",
      "",
      "1. Choose one task. That task is: " + task + ".",
      "2. Write down what the finished result looks like in one sentence.",
      "3. Write down the first physical action needed to start.",
      "4. Do only that first physical action.",
      `5. Set a timer for ${stepSeconds(supportLevel)} seconds.`,
      "6. When the timer ends: stop. Write one sentence about what changed.",
      "",
      "Stop point: when the timer ends.",
      safeDisclaimer()
    ].join("\n");
  }

  if (containsAny(message, ["habit", "routine", "consistent", "repeat", "every day", "daily"])) {
    return [
      supportLead(supportLevel),
      "",
      "Here is how to set up a habit. Follow these steps.",
      "",
      "1. Name the habit. Use one sentence that describes the exact action.",
      "   Example: 'Take one vitamin at 8am with water.'",
      "2. Choose a cue. A cue is a specific event that happens before the habit.",
      "   Example: 'After I make coffee.'",
      "3. Set the smallest version. This is the version you can do even on a bad day.",
      "   Example: 'Take one vitamin.'",
      "4. Go to the Habits section. Add the habit there.",
      "",
      "Stop point: when the habit is added to the app.",
      safeDisclaimer()
    ].join("\n");
  }

  if (containsAny(message, ["focus", "timer", "start", "begin", "work on"])) {
    return [
      supportLead(supportLevel),
      "",
      "Here are the steps to start a focus session.",
      "",
      "1. Go to the Focus section.",
      "2. Choose one task. That task is: " + task + ".",
      "3. Set the timer.",
      `4. Work on only that task for ${stepSeconds(supportLevel)} seconds.`,
      "5. Do not switch tasks during the timer.",
      "6. When the timer ends: stop. Mark progress.",
      "",
      "Stop point: when the timer ends.",
      safeDisclaimer()
    ].join("\n");
  }

  if (containsAny(message, ["checklist", "steps", "breakdown", "break down", "break it down"])) {
    return [
      supportLead(supportLevel),
      "",
      "Here is how to break a task into steps.",
      "",
      "1. Name the task in one sentence.",
      "2. Write the end result. What does done look like exactly?",
      "3. Write the first physical action.",
      "4. Write the second physical action.",
      "5. Continue until you have 3 to 5 steps.",
      "6. Do step 1 now.",
      "",
      "Note: if a step is unclear, make it smaller until it is clear.",
      "Stop point: when step 1 is complete.",
      safeDisclaimer()
    ].join("\n");
  }

  // Default response
  return [
    supportLead(supportLevel),
    "",
    "Here is what to do next.",
    "",
    "1. Choose one task. That task is: " + task + ".",
    "2. State what done looks like for that task in one sentence.",
    "3. Do the first physical action for that task.",
    `4. Set a timer for ${stepSeconds(supportLevel)} seconds.`,
    "5. When the timer ends: stop. Decide whether to continue.",
    "",
    "Stop point: when the timer ends.",
    safeDisclaimer()
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
    replySystems(msg, input.data, supportLevel);

  return {
    id: uid(),
    role: "assistant",
    sidekickId: input.sidekickId,
    content,
    ts: nowIso()
  };
}
