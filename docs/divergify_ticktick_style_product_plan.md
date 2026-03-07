# Divergify TickTick-Style Product Plan

## Product Goal
Build a productivity app with TickTick-level utility, then layer Divergify-native behavior on top:
- overwhelm-aware planning (your gauge/check-in),
- adaptive task scaffolding,
- personality-driven support (sidekicks),
- cleaner focus flow for neurodivergent users.

## Positioning
- Build feature parity with a modern task planner.
- Keep Divergify branding, UX voice, and behavior model.
- Do not copy another app's visual design or trademarked brand elements.

## Existing Divergify Pieces To Keep
- Overwhelm/check-in flow: `src/components/TakotaCheckIn.tsx`
- Status/gauge expression: `src/components/TakotaStatus.tsx`
- Personality engine and copy: `src/sidekicks/engine.ts`, `src/sidekicks/copy.ts`, `src/sidekicks/defs.ts`
- Focus timer baseline: `src/components/FocusTimer.tsx`
- Route foundations already in place: `src/routes/Tasks.tsx`, `src/routes/Habits.tsx`, `src/routes/Today.tsx`, `src/routes/Focus.tsx`

## Feature Scope

### P0: Must Have (Launchable Core)
- Inbox + projects + sections/lists
- Tasks with:
  - due date/time
  - recurring rules
  - priorities
  - tags
  - subtasks/checklists
  - notes
- Smart views:
  - Today
  - Upcoming (7 days)
  - Overdue
- Reminders/notifications (local first, push later)
- Calendar view (day/week) with drag/drop scheduling
- Focus mode (Pomodoro + countdown timer)
- Offline-first local storage with sync queue
- Account + cloud sync

### P1: Strong Differentiators
- Overwhelm gauge influences daily workload target
- One-anchor-task mode (single mission lane)
- Auto-scaffold for large tasks:
  - break task into startable steps
  - suggest first 5-minute action
- Sidekick tone mode:
  - direct
  - gentle
  - chaotic-funny
  - coach
- Dynamic "too much today" guardrail that recommends rescheduling

### P2: Competitive Depth
- Habit tracking + streak logic
- Smart lists via filters
- Templates (morning reset, shutdown, planning)
- Natural-language task entry
- Team/shared lists
- Attachments/comments

## Recommended Architecture
- Frontend: React + TypeScript (current stack)
- Local data: IndexedDB (Dexie or equivalent) for offline-first behavior
- Sync backend: Postgres + API (Supabase or custom Node service)
- Auth: email magic link + OAuth
- Notifications:
  - web push
  - optional mobile via Capacitor later
- AI features:
  - scaffold generation and phrasing in a bounded service layer
  - never block core task UX on AI availability

## Data Model (Core)
- User
- Project
- Section
- Task
- Subtask
- Tag
- TaskTag
- Reminder
- RecurrenceRule
- FocusSession
- CheckIn (overwhelm, energy, capacity, mood)
- SidekickPreference
- DailyPlanSnapshot

## Migration Strategy From Current App
1. Freeze current routes as v0 shell.
2. Introduce new task domain model and storage adapter.
3. Replace `Tasks` and `Today` route internals first.
4. Integrate check-in score into planner scoring.
5. Expand focus and habit modules.
6. Add sync and account layer.

## Prioritization Formula (Divergify Core)
Task score should combine:
- urgency (due date proximity),
- importance (priority),
- effort cost,
- current overwhelm/capacity,
- task size/start friction.

When overwhelm is high, auto-suggest:
- fewer tasks,
- smaller steps,
- one anchor task.

## 6-Week Delivery Plan

### Week 1
- Finalize schema and storage layer
- Build Inbox/Projects/Tasks CRUD
- Ship Today + Upcoming views

### Week 2
- Recurrence, reminders, tags, subtasks
- Calendar view v1

### Week 3
- Check-in to planning pipeline
- Overwhelm-adjusted daily plan

### Week 4
- Sidekick tone engine integration
- Scaffold suggestion UX

### Week 5
- Focus mode v2 + habit/streak integration
- QA on offline behavior and sync conflicts

### Week 6
- Beta hardening
- analytics + bug triage
- release candidate

## 3-Week Crash Plan (Current Priority)

### Week 1 (Now)
- Ship planner foundation:
  - priorities
  - projects
  - repeat rules
  - smart views (Today/Upcoming/Overdue/Inbox)
- Keep overwhelm check-in and tie it to daily task cap
- Improve Today page so anchor task is always obvious

### Week 2
- Add calendar view (day/week) and drag scheduling
- Add reminders (local first)
- Add stronger recurrence editing + edge case handling
- Add task templates for common flows

### Week 3
- Add account + sync (single-user first)
- Harden focus + habit loops
- Beta QA pass and bug fixes
- Ship test build for daily use

## What We Need From You (Minimal)
- Default assumption if you do not answer: we proceed.
- Decisions only:
  1. Auth for v1: magic link email only, or no-login local-first beta first.
  2. Calendar scope: basic day/week in v1, or postpone calendar to v1.1.
  3. Sync scope: one-device local-first first, or cloud sync in v1.

## Immediate Build Tasks (Start Now)
1. Add a `task_domain` module (types + validators + adapters).
2. Refactor `src/routes/Tasks.tsx` to use the new domain layer.
3. Create `planner_score.ts` to fuse urgency/priority/overwhelm.
4. Add `daily_plan_service.ts` to produce Today list + anchor task.
5. Add regression tests for recurrence and scoring behavior.

## Success Metrics
- 7-day retention
- daily task completion rate
- median time-to-first-action after opening app
- user-reported overwhelm before vs after session
- "I know what to do next" self-report rate
