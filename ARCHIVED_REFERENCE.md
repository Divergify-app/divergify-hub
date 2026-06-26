# divergify-hub — ARCHIVED REFERENCE
> **This repo is archived. Do not develop here.**
> Active development lives in: `github.com/Divergify-app/divergify-mobile-app`

This document captures everything worth porting or referencing from hub-app when building features in the mobile app.

---

## Features in hub-app NOT yet in mobile-app

### 1. Sidekick Personality System (most developed version)
- **File:** `apps/divergify-hub-app/src/sidekicks/defs.ts`
- **What it has:** 6 sidekicks — Takota, Scholar, Rex (chaotic hype), Sage, Circuit, Coach — each with full personality definition: tone, check-in title/hint, style tag, prompt overlays, and hard boundaries (e.g. "No mocking", "No risky dares")
- **File:** `apps/divergify-hub-app/src/sidekicks/copy.ts`
- **What it has:** Per-sidekick UI copy for every screen (tasks, habits, focus, brain dump, magic tasks) — all neurodivergent-safe language, no streak shame, no toxic positivity
- **Port priority:** HIGH — mobile-app has 5 personalities but the copy/boundary system is more polished here

### 2. Brain Dump Parser
- **File:** `apps/divergify-hub-app/src/shared/brainDump.ts`
- **What it has:** Smart text parser that splits a messy brain dump into `now / later / notes` buckets using action hints, time hints, and note markers. Pure logic, no UI dependency.
- **Port priority:** HIGH — mobile-app has no brain dump feature at all

### 3. Focus Timer with Sidekick Nudges
- **File:** `apps/divergify-hub-app/src/components/FocusTimer.tsx`
- **What it has:** Timebox sprint timer with sidekick-specific nudges during and after the session, end-of-sprint debrief prompt
- **Port priority:** MEDIUM — mobile-app has a task timer stub but no full focus sprint flow

### 4. Habits Tracking
- **File:** `apps/divergify-hub-app/src/routes/Habits.tsx`
- **What it has:** Tiny habit tracking with no streak shame, backup plan prompts ("if you can't do the habit, do the first 60 seconds"), recurring habit logic
- **Port priority:** MEDIUM

### 5. Magic Tasks (AI micro-step breakdown)
- **File:** `apps/divergify-hub-app/src/routes/MagicTasks.tsx`
- **What it has:** "De-scary-fy" button — takes a big intimidating task and breaks it into tiny safe steps via AI
- **Port priority:** HIGH — this is a core differentiator for neurodivergent users

### 6. Calendar Board
- **File:** `apps/divergify-hub-app/src/routes/Calendar.tsx`
- **What it has:** Day/week scheduling view with drag-and-drop rescheduling
- **Port priority:** LOW (complex, not blocking store launch)

### 7. Today View / Anchor Task
- **File:** `apps/divergify-hub-app/src/routes/Today.tsx`
- **What it has:** Always surfaces the single best next task to start ("anchor task"), capacity-aware daily task cap, overwhelm gauge
- **Port priority:** HIGH — mobile-app home screen has check-in but no anchor task logic

### 8. Play Store Listing Copy
- **File:** `apps/divergify-hub-app/PLAY_STORE_COPY.md`
- **What it has:** Fully written, vetted Google Play listing — app name, short description, full description, privacy policy URL. Ready to use directly.
- **Port priority:** IMMEDIATE — copy this into mobile-app store submission

---

## What hub-app does NOT have (mobile-app is ahead)
- Takota AI with real LLM (OpenAI via tRPC)
- 5 AI personalities wired to actual chat
- Divergipedia (77 neurodivergent terms, search, detail view)
- Dopamine Depot with live Printful products
- Social media agent (content queue, approve/skip)
- Token system UI
- iOS support (hub-app is Android-only via Capacitor)
- Tin Foil Hat Mode (privacy master toggle)

---

## Beta site (stays live, read-only)
- `https://divergify-hub-beta-jess.netlify.app`
- Do not redeploy. Leave it up as a web preview reference.

---

## Archive date
June 2026
