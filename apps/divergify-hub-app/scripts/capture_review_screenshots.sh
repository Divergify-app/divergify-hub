#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_URL="${1:-http://127.0.0.1:4173}"
OUTPUT_DIR="$APP_ROOT/output/playwright/review-packet"
PACKET_DIR="$APP_ROOT/research/review-packet"

export CODEX_HOME="${CODEX_HOME:-$HOME/.codex}"
export PWCLI="$CODEX_HOME/skills/playwright/scripts/playwright_cli.sh"

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is required to run Playwright CLI." >&2
  exit 1
fi

if [[ ! -x "$PWCLI" ]]; then
  echo "Playwright wrapper not found at $PWCLI" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR" "$PACKET_DIR"

SEED_PATH="$PACKET_DIR/app_state.seed.json"
SESSION_AT="$(date -Iseconds)"

node >"$SEED_PATH" <<'NODE'
function pad(value) {
  return String(value).padStart(2, "0");
}

function localDate(daysFromToday = 0) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + daysFromToday);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function isoAt(daysFromToday = 0, hours = 12, minutes = 0) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

const today = localDate(0);
const yesterday = localDate(-1);
const tomorrow = localDate(1);
const inTwoDays = localDate(2);
const inFourDays = localDate(4);
const nextWeek = localDate(7);

const data = {
  version: 1,
  hasOnboarded: true,
  hasCompletedKickoff: true,
  activeSidekickId: "takota",
  onboardingProfile: {
    reason: "I lose momentum when home and work tasks pile up at the same time.",
    primaryGoal: "Keep the day moving without burning out.",
    focusArea: "Work + home",
    anchorTask: "Send the project update and pay the electric bill",
    stimulationLevel: 45,
    selectedTemplateId: "planning-block",
    createdAt: isoAt(-2, 9, 15)
  },
  preferences: {
    humor: "light",
    fontScale: 1,
    reduceMotion: false,
    shades: false,
    lowStim: false,
    tinFoil: false,
    loopGuard: { enabled: true, softLimitPerHour: 18, cooldownMinutes: 2 }
  },
  tasks: [
    {
      id: "task-project-update",
      title: "Send the project update to Maya",
      notes: "Three bullets is enough. Attach the latest draft and stop.",
      dueDate: today,
      startAt: `${today}T09:30`,
      location: "Home office",
      project: "Work",
      priority: 1,
      recurrence: "none",
      estimateMinutes: 30,
      tags: ["anchor", "work"],
      checklist: [
        { id: "task-project-update-1", text: "Open the latest draft", done: true },
        { id: "task-project-update-2", text: "Write the three bullet summary", done: false },
        { id: "task-project-update-3", text: "Send before lunch", done: false }
      ],
      done: false,
      createdAt: isoAt(-1, 18, 30),
      updatedAt: isoAt(0, 8, 45)
    },
    {
      id: "task-electric-bill",
      title: "Pay the electric bill before 4 PM",
      notes: "Use autopay if the total looks normal.",
      dueDate: today,
      project: "Home",
      priority: 2,
      recurrence: "none",
      estimateMinutes: 10,
      tags: ["bills", "home"],
      checklist: [],
      done: false,
      createdAt: isoAt(-1, 15, 10),
      updatedAt: isoAt(0, 8, 15)
    },
    {
      id: "task-prescription",
      title: "Pick up prescription on lunch break",
      notes: "Bring water and the pharmacy coupon.",
      dueDate: yesterday,
      project: "Health",
      priority: 1,
      recurrence: "none",
      estimateMinutes: 20,
      tags: ["health", "errands"],
      checklist: [],
      done: false,
      createdAt: isoAt(-3, 14, 0),
      updatedAt: isoAt(-1, 17, 45)
    },
    {
      id: "task-laundry",
      title: "Start one laundry load before dinner",
      notes: "Darks only. Do not turn this into a whole-house reset.",
      dueDate: tomorrow,
      startAt: `${tomorrow}T18:00`,
      location: "Home",
      project: "Home",
      priority: 3,
      recurrence: "none",
      estimateMinutes: 15,
      tags: ["home"],
      checklist: [],
      done: false,
      createdAt: isoAt(0, 7, 40),
      updatedAt: isoAt(0, 7, 40)
    },
    {
      id: "task-school-forms",
      title: "Pack tomorrow's school forms",
      notes: "Put them by the keys tonight so morning is cheaper.",
      dueDate: inTwoDays,
      project: "Family",
      priority: 2,
      recurrence: "none",
      estimateMinutes: 10,
      tags: ["family"],
      checklist: [],
      done: false,
      createdAt: isoAt(0, 9, 0),
      updatedAt: isoAt(0, 9, 0)
    },
    {
      id: "task-grocery-reset",
      title: "Plan next week's grocery reset",
      notes: "Keep it short: breakfast, lunch, meds, and snacks.",
      dueDate: nextWeek,
      project: "Life admin",
      priority: 4,
      recurrence: "weekly",
      estimateMinutes: 15,
      tags: ["planning"],
      checklist: [],
      done: false,
      createdAt: isoAt(-1, 11, 0),
      updatedAt: isoAt(-1, 11, 0)
    },
    {
      id: "task-done-water",
      title: "Refill water bottle and meds",
      notes: "Left them by the bag for tomorrow.",
      dueDate: yesterday,
      project: "Health",
      priority: 2,
      recurrence: "none",
      estimateMinutes: 10,
      tags: ["reset"],
      checklist: [],
      done: true,
      completedAt: isoAt(-1, 16, 30),
      createdAt: isoAt(-2, 10, 0),
      updatedAt: isoAt(-1, 16, 30)
    }
  ],
  habits: [
    {
      id: "habit-meds",
      name: "Take meds with breakfast",
      cue: "When the coffee starts",
      tinyVersion: "Set the meds beside the mug",
      frequency: "daily",
      checkins: [today, yesterday],
      createdAt: isoAt(-10, 8, 0),
      updatedAt: isoAt(0, 8, 0)
    },
    {
      id: "habit-reset",
      name: "Ten-minute kitchen reset",
      cue: "After lunch",
      tinyVersion: "Put five things away",
      frequency: "daily",
      checkins: [yesterday],
      createdAt: isoAt(-7, 13, 0),
      updatedAt: isoAt(-1, 13, 0)
    },
    {
      id: "habit-water",
      name: "Fill water bottle before leaving",
      cue: "Shoes on, bottle filled",
      tinyVersion: "Add ice and fill halfway",
      frequency: "weekly",
      checkins: [inFourDays],
      createdAt: isoAt(-14, 19, 0),
      updatedAt: isoAt(-14, 19, 0)
    }
  ],
  focus: [
    {
      id: "focus-project-update",
      label: "Project update email",
      minutesPlanned: 15,
      startedAt: isoAt(0, 10, 0),
      endedAt: isoAt(0, 10, 15),
      outcome: "done",
      notes: "Wrote the summary and attached the draft."
    },
    {
      id: "focus-kitchen-reset",
      label: "Kitchen reset",
      minutesPlanned: 10,
      startedAt: isoAt(-1, 15, 20),
      endedAt: isoAt(-1, 15, 30),
      outcome: "stopped",
      notes: "Stopped after the counters were clear enough."
    },
    {
      id: "focus-bills",
      label: "Bills and appointments",
      minutesPlanned: 20,
      startedAt: isoAt(-1, 11, 0),
      endedAt: isoAt(-1, 11, 20),
      outcome: "done",
      notes: "Paid one bill and set the next reminder."
    }
  ],
  chat: [
    {
      id: "chat-assistant-1",
      role: "assistant",
      sidekickId: "takota",
      content: "I am Takota. Helpful, not precious. We will keep the day small enough to finish.",
      ts: isoAt(-2, 9, 15)
    },
    {
      id: "chat-user-1",
      role: "user",
      sidekickId: "takota",
      content: "I have work stuff and home stuff stacked together and I need one clear place to start.",
      ts: isoAt(0, 8, 32)
    },
    {
      id: "chat-assistant-2",
      role: "assistant",
      sidekickId: "takota",
      content: "Then we pick the smallest useful thing first and let the rest wait. Start with the update, then the bill.",
      ts: isoAt(0, 8, 33)
    }
  ],
  doneForTodayAt: null,
  ui: {
    sidekickDrawerOpen: false
  }
};

process.stdout.write(JSON.stringify(data));
NODE

if ! curl -sf "$APP_URL" >/dev/null 2>&1; then
  echo "Preview server is not reachable at $APP_URL" >&2
  exit 1
fi

SEED_JSON="$(cat "$SEED_PATH")"

"$PWCLI" close-all >/dev/null 2>&1 || true
"$PWCLI" open "$APP_URL/onboarding" >/dev/null
"$PWCLI" resize 430 932 >/dev/null
"$PWCLI" localstorage-clear >/dev/null
"$PWCLI" sessionstorage-clear >/dev/null
"$PWCLI" reload >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/01-onboarding-first-launch.png" >/dev/null

"$PWCLI" localstorage-set "divergify:app:v1" "$SEED_JSON" >/dev/null
"$PWCLI" localstorage-set "divergify.session.state" "neutral" >/dev/null
"$PWCLI" localstorage-set "divergify.session.stateSetAt" "$SESSION_AT" >/dev/null
"$PWCLI" localstorage-set "divergify.session.overwhelm" "45" >/dev/null
"$PWCLI" localstorage-delete "divergify.session.stateSkippedAt" >/dev/null || true

"$PWCLI" goto "$APP_URL/" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/02-today.png" >/dev/null
"$PWCLI" goto "$APP_URL/tasks" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/03-planner.png" >/dev/null
"$PWCLI" goto "$APP_URL/calendar" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/04-calendar.png" >/dev/null
"$PWCLI" goto "$APP_URL/focus" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/05-focus.png" >/dev/null
"$PWCLI" goto "$APP_URL/habits" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/06-habits.png" >/dev/null
"$PWCLI" goto "$APP_URL/sidekicks" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/07-sidekicks.png" >/dev/null
"$PWCLI" goto "$APP_URL/settings" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/08-settings.png" >/dev/null
"$PWCLI" goto "$APP_URL/feedback" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/09-support.png" >/dev/null
"$PWCLI" goto "$APP_URL/legal/privacy" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/10-privacy.png" >/dev/null
"$PWCLI" goto "$APP_URL/brain-dump" >/dev/null
"$PWCLI" screenshot --full-page --filename "$OUTPUT_DIR/11-brain-dump.png" >/dev/null

echo "Saved screenshots to $OUTPUT_DIR"
echo "Saved seeded state to $SEED_PATH"
