# Divergify Scaffold Snapshot (2026-03-07)

## Goal
Deliver a clear TickTick-style flow while keeping Divergify personality, overwhelm-aware planning, and sidekick support.

## User Flow
1. Onboarding (`/onboarding`)
2. Kickoff checklist (`/kickoff`)
3. Daily execution (`/`)
4. Planning and scheduling (`/tasks`)
5. Focus sprint execution (`/focus`)
6. Breakdown help (`/magic-tasks`)

## Feature Status

### Live
- Overwhelm gauge + support levels
- TickTick-style planner views (Today/Upcoming/Overdue/Inbox/All)
- Task priority, project, repeat, estimate
- Recurring task regeneration on completion
- Post-onboarding kickoff lane
- Anchor-task and next-step guidance
- Focus timer with sidekick nudges
- Calendar board (day/week drag scheduling)

### Scaffolded (next implementation)
- Reminder rules and alerts
- Conflict hints + schedule balancing prompts

### Next
- Account auth + cloud sync
- Multi-device conflict handling

## Why This Branch Exists
This snapshot is isolated on a dated branch so main can stay stable while this flow is tested.
