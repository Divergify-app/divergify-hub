import type { SidekickId } from "../state/types";

export type PersonaCopy = {
  tasksHeading: string;
  tasksSub: string;
  tasksEmptyOpen: string;
  tasksEmptyDone: string;
  habitsHeading: string;
  habitsSub: string;
  habitsEmpty: string;
  habitsBackup: string;
  focusHeading: string;
  focusSub: string;
  focusEmptySessions: string;
  focusTimerHeading: string;
  focusTimerSub: string;
  focusRunningHint: string;
  focusDoneNotice: string;
  todayProgressNote: string;
  magicTasksHeading: string;
  magicTasksSub: string;
  magicTasksEmpty: string;
  doneEmptyOpenTask: string;
};

const BASE: PersonaCopy = {
  tasksHeading: "Small tasks count.",
  tasksSub: "If it feels too big, shrink it until it is doable in 2 minutes.",
  tasksEmptyOpen: "No open tasks.",
  tasksEmptyDone: "Nothing marked done yet. That is not a crime.",
  habitsHeading: "No streak shame. Just check-ins.",
  habitsSub: "If it is not doable on a hard day, it is too big. Shrink it.",
  habitsEmpty: "No habits yet. Start with one tiny habit when you are ready.",
  habitsBackup: "Backup plan: if you cannot do the habit, do the first 60 seconds. That still counts.",
  focusHeading: "Timebox the chaos.",
  focusSub: "Pick one target. Run one timer. Stop on purpose when it ends.",
  focusEmptySessions: "No focus sessions logged yet.",
  focusTimerHeading: "One target. One timer. No side quests.",
  focusTimerSub: "When it ends, you either stop or choose another sprint. No infinite grind.",
  focusRunningHint: "Do the smallest next action. Ignore the rest.",
  focusDoneNotice: "Sprint complete. Write one line: what changed? Then stop or choose the next sprint on purpose.",
  todayProgressNote: "Progress is movement, not perfection. No streak shame. No moral score.",
  magicTasksHeading: "Big task. Tiny steps.",
  magicTasksSub: "Break it down until the first step feels safe.",
  magicTasksEmpty: "Enter a task and click De-scary-fy.",
  doneEmptyOpenTask: "No open tasks. Protect that peace."
};

const OVERRIDES: Partial<Record<SidekickId, Partial<PersonaCopy>>> = {
  takota: {
    tasksSub: "Keep it small and honest. Two minutes counts.",
    focusHeading: "Timebox the noise.",
    focusSub: "Pick one target. Run one timer. Stop on purpose."
  },
  scholar: {
    tasksHeading: "Define done. Then do the first step.",
    tasksSub: "Clarity first: name the outcome, then the smallest observable action.",
    habitsHeading: "Reduce friction. Increase consistency.",
    habitsSub: "If it fails on a hard day, it is too big. Reduce scope.",
    focusHeading: "Timebox with intent.",
    focusSub: "Pick one target, set one timer, stop when it ends.",
    magicTasksSub: "Break it down into a sequence you can execute."
  },
  chaos_buddy: {
    tasksHeading: "Make it small and weird enough to start.",
    tasksSub: "Novelty helps. Shrink it until it feels almost silly.",
    habitsHeading: "Low pressure. Tiny wins.",
    habitsSub: "Keep it playful and light. Your brain likes that.",
    focusHeading: "Short sprints. Fresh energy.",
    focusSub: "Pick one target. Sprint. Stop. Decide.",
    focusDoneNotice: "Sprint complete. Mark a win. Then stop or choose another sprint."
  },
  drill_coach: {
    tasksHeading: "One task. Execute.",
    tasksSub: "Define the target and start. No warm-up required.",
    habitsHeading: "Make it simple. Do it anyway.",
    habitsSub: "If it is too big, you will skip it. Shrink it.",
    focusHeading: "Timebox. Execute. Stop.",
    focusSub: "Pick one target. Run one timer. End on purpose.",
    focusRunningHint: "Do the first action now. Ignore the rest."
  },
  zen: {
    tasksHeading: "Small, calm steps.",
    tasksSub: "If it feels heavy, reduce the size until it feels calm.",
    habitsHeading: "Soft consistency.",
    habitsSub: "Gentle actions count. Keep it easy to start.",
    focusHeading: "Quiet focus.",
    focusSub: "Pick one target. One timer. Stop when it ends.",
    focusDoneNotice: "Sprint complete. Breathe once. Then stop or choose another sprint."
  },
  systems: {
    tasksHeading: "Define the system step.",
    tasksSub: "Name the output, then the smallest input that produces it.",
    habitsHeading: "Build the loop.",
    habitsSub: "If it fails, reduce the step size until it is reliable.",
    focusHeading: "Run the process.",
    focusSub: "Pick one target. Run one timer. End on purpose.",
    focusRunningHint: "Execute the next system step. Ignore the rest."
  }
};

export function getPersonaCopy(id: SidekickId): PersonaCopy {
  return { ...BASE, ...(OVERRIDES[id] ?? {}) };
}
