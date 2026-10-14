# AI handoff — conversation-first Hub

## 2026-10-14 — Codex

### Founder direction

Jess wants to open the app and immediately talk to Takota, brain dump conversationally, receive spoken replies, and get help deciding what deserves attention. Explanatory and promotional text belongs on the website. Forms, task boards, and calendars must not be mandatory entry screens. In future, Takota should use authorized calendar access and give preparation-aware nudges early enough to be useful.

Jess was told the code in this session is held in `Divergify-app/divergify-hub`, folder `apps/divergify-hub-app`, branch `codex/takota-conversation-2026-10-14`. Do not move this work or switch to `Divergify-app/divergify-mobile-app` without making the choice explicit to Jess. No new repository was created.

### What this pass actually does

- `/` opens a low-text conversation screen without mandatory onboarding or daily check-in. Old `/onboarding` links redirect there. Optional full setup remains at `/setup`; Today is at `/today`.
- The app shell has a small Tools menu instead of an always-visible dashboard/marketing sidebar. Existing task, calendar, habits, focus, privacy, and sidekick tools remain available.
- Browser speech recognition accumulates all final segments once; native capture uses the existing Capacitor plugin. A session-specific disclosure precedes speech-service use. No microphone starts on launch. Captured words are saved as chat only when a completed voice turn or explicit typed send is submitted.
- Speech synthesis reads replies after the user enables voice, with Hear reply, Mute replies, Stop voice, and text fallback. Recognition is stopped before playback. Leaving the page, hiding it, or enabling Tinfoil Hat cancels voice and discards late callbacks. Tinfoil Hat blocks all voice in this pass because the device/browser may use online speech processing.
- The new conversation route makes **zero AI/network calls**. `shared/conversation.ts` is a small labeled local fallback that asks one short question, can refer to saved Tasks, and admits outside calendars are not connected. This is not an intelligent conversation engine.
- Timed unfinished Tasks within two hours appear as appointment nudges while this route is open. An opted-in spoken nudge occurs once per saved appointment per mounted conversation screen. There is no wake-up/background scheduling or notification claim. Get-ready and travel durations are asked for, never invented.
- Saving a thought as a Task is an explicit action, with editing first and repeat-save protection. No automatic task creation, scheduling, or calendar mutation.
- Existing local storage keys and user data are retained. Old conversation history remains available in a collapsed section.

### Validation and limits

TypeScript and Vite/PWA production build pass. 21 Vitest tests pass (11 existing plus 10 added). Added cases cover transcript accumulation, invalid dates, local wall-clock appointments, earliest unfinished appointment selection, no invented prep/travel durations, urgent saved-task priority, and truthful missing external calendar access.

No physical-device speech, browser permission, voice service, accessibility, narrow-screen screenshot, or background notification verification has been completed. Speech behavior needs actual Android testing. The native plugin uses a popup capture flow; this is turn-based voice, not full-duplex audio or an always-listening assistant.

### Next implementation work

1. Review this first entry-flow change with Jess. Preserve the conversation-first direction, and make the long-term canonical runtime/repo decision explicit before porting it.
2. Integrate the existing October Takota engine and consent/privacy contracts from the separate mobile app rather than calling the Hub’s older ungated AI endpoints. Confirm the actual provider, live deployment, budget, and retention before activating real AI. Do not claim paid tokens or BYOK are ready.
3. Add an authorized external calendar integration with explicit scopes. Distinguish someone else’s appointment from Jess’s commitments; shared calendars need verified ownership/permissions.
4. Let users choose preparation and travel lead time, then add reliable platform notifications. Browser-open polling is not a dependable two-hour reminder.
5. Verify microphone denied, unsupported speech, errors after partial capture, stopping with a final result pending, late native result after privacy cancellation, screen hidden/unmounted, long rambling dictation, interrupting playback, 320px/390px widths, large text, and screen readers.

Production was not changed. A draft PR is the review checkpoint; record its URL when created.
