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

export type Task = {
  id: string;
  title: string;
  notes?: string;
  dueDate?: string;
  tags: string[];
  done: boolean;
  createdAt: string;
  updatedAt: string;
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
  activeSidekickId: SidekickId;

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
