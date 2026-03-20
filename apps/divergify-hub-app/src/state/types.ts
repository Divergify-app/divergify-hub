export type Humor = "neutral" | "light" | "sarcastic_supportive";
export type SidekickId =
  | "takota"
  | "scholar"
  | "chaos_buddy"
  | "drill_coach"
  | "zen"
  | "systems";

export type Preferences = {
  humor: Humor;
  fontScale: number;
  reduceMotion: boolean;

  shades: boolean;
  lowStim: boolean;
  tinFoil: boolean;

  // anti-hook
  loopGuard: { enabled: boolean; softLimitPerHour: number; cooldownMinutes: number };
};

export type TaskPriority = 1 | 2 | 3 | 4;
export type TaskRecurrence = "none" | "daily" | "weekdays" | "weekly" | "monthly";

export type TaskChecklistItem = {
  id: string;
  text: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  startAt?: string;
  location?: string;
  project: string;
  priority: TaskPriority;
  recurrence: TaskRecurrence;
  estimateMinutes?: number;
  tags: string[];
  checklist: TaskChecklistItem[];
  done: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type OnboardingProfile = {
  reason: string;
  primaryGoal: string;
  focusArea: string;
  anchorTask: string;
  stimulationLevel: number;
  selectedTemplateId: string | null;
  createdAt: string;
};

export type Habit = {
  id: string;
  name: string;
  cue?: string;
  tinyVersion?: string;
  frequency: "daily" | "weekly";
  checkins: string[]; // ISO dates
  createdAt: string;
  updatedAt: string;
};

export type FocusSession = {
  id: string;
  label: string;
  minutesPlanned: number;
  startedAt: string;
  endedAt: string;
  outcome: "done" | "stopped" | "abandoned";
  notes?: string;
};

export type ChatTurn = {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: string;
  sidekickId: SidekickId;
};

export type AppData = {
  version: 1;
  hasOnboarded: boolean;
  hasCompletedKickoff: boolean;
  activeSidekickId: SidekickId;
  onboardingProfile: OnboardingProfile | null;

  preferences: Preferences;

  tasks: Task[];
  habits: Habit[];
  focus: FocusSession[];

  chat: ChatTurn[];

  doneForTodayAt: string | null;

  ui: {
    sidekickDrawerOpen: boolean;
  };
};
