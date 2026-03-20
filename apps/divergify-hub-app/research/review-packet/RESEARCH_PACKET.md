# Divergify Review Packet

This packet is meant to give a reviewer enough grounded context to assess the current Divergify Android app build without inventing features that are not actually shipped.

## What Divergify is in this release

Divergify is a local-first Android planner for neurodivergent users. The current release is centered on task capture, daily planning, focus support, habit tracking, and sidekick-style guidance with a human tone. It is not a social app, not a cloud-sync app, and not a voice-first assistant in this build.

Core release themes:

- Quick capture for messy thoughts
- Task-first planning with today/planner/calendar views
- Gentle support that adapts to daily overwhelm
- Sidekick guidance with different tones
- Local-first storage with export/import
- Optional cloud assist only in specific assisted flows
- Tin Foil Hat mode to keep supported flows local

## What is live vs. what should not be assumed

Use the current code and screenshots as the source of truth.

Live in the current app:

- Onboarding flow on first launch
- Today view and planner view
- Calendar board with day/week scheduling
- Brain Dump intake and conversion into tasks
- Focus timer and recent focus session log
- Habits tracking
- Sidekick selection
- Settings, local export/import, and privacy/legal routes
- Support route with email and policy links
- Android release bundle generation

Do not assume these are fully shipped unless you find direct proof in code and screenshots:

- Full cloud sync
- Voice input or text-to-speech features
- Community/social features
- Realtime notifications/reminders at production quality
- Reward/confetti systems
- Subscription billing
- A final fully packaged launcher/store icon set beyond the restored in-app constellation logo

## Repo map

Review these first:

- `src/App.tsx`
- `src/routes/Shell.tsx`
- `src/routes/Onboarding.tsx`
- `src/routes/Today.tsx`
- `src/routes/Tasks.tsx`
- `src/routes/Calendar.tsx`
- `src/routes/BrainDump.tsx`
- `src/routes/Focus.tsx`
- `src/routes/Habits.tsx`
- `src/routes/Sidekicks.tsx`
- `src/routes/Settings.tsx`
- `src/routes/Feedback.tsx`
- `src/routes/LegalPrivacy.tsx`
- `src/components/TaskWorkspace.tsx`
- `src/state/store.ts`
- `src/state/sessionState.tsx`
- `src/state/useApp.tsx`
- `PLAY_STORE_COPY.md`
- `APP_STORE_PATH.md`
- `research/review-packet/PLAY_DATA_SAFETY_DRAFT.md`
- `research/review-packet/PLAY_CONSOLE_FILL_OUT.md`
- `research/review-packet/PLAY_STORE_ASSET_PLAN.md`

## Public-policy and support context

The app currently points users to:

- Privacy policy: `https://divergify.app/privacy.html`
- Support email: `chaoscontrol@divergify.app`
- Contact page: `https://divergify.app/contact.html`

Relevant in-app privacy stance:

- Tasks, habits, focus history, chat history, and settings stay on-device by default
- Local export/import is available from Settings
- Tin Foil Hat mode blocks optional cloud assist calls
- The release should be evaluated as local-first, not cloud-first
- A conservative Play submission draft now lives in `research/review-packet/PLAY_DATA_SAFETY_DRAFT.md`

## Screenshot set

These screenshots were generated from the current repo against the local preview build with seeded review data.

Source seed:

- `research/review-packet/app_state.seed.json`

Capture script:

- `scripts/capture_review_screenshots.sh`

Screenshot paths:

- `output/playwright/review-packet/01-onboarding-first-launch.png`
- `output/playwright/review-packet/02-today.png`
- `output/playwright/review-packet/03-planner.png`
- `output/playwright/review-packet/04-calendar.png`
- `output/playwright/review-packet/05-focus.png`
- `output/playwright/review-packet/06-habits.png`
- `output/playwright/review-packet/07-sidekicks.png`
- `output/playwright/review-packet/08-settings.png`
- `output/playwright/review-packet/09-support.png`
- `output/playwright/review-packet/10-privacy.png`
- `output/playwright/review-packet/11-brain-dump.png`

Screenshot intent:

- `01`: first-launch onboarding and first impression
- `02`: today view and support framing
- `03`: planner depth and task organization
- `04`: calendar scheduling workflow
- `05`: focus execution flow
- `06`: habits model
- `07`: sidekick positioning and tone
- `08`: settings, privacy controls, and local data controls
- `09`: support/release readiness
- `10`: in-app privacy language
- `11`: fast capture / brain dump workflow

## Branding reality

The current shell now uses the approved constellation-style `D` mark again alongside the light wordmark. Reviewers should treat the in-app brand direction as restored, while still checking whether launcher icons, store graphics, and screenshot framing are packaged consistently.

Current approved direction from the product owner:

- Wordmark should stay light and readable on dark surfaces
- The preferred icon is the real constellation-style `D` made from stars
- The visible shell should use the approved mark, not an improvised approximation
- Tone should feel human and grounded, not AI-generic

## Questions the review should answer

1. Is the product proposition clear from the app alone?
2. Does the UX feel meaningfully better for neurodivergent users than a generic task app?
3. Which parts feel app-store ready and which still feel beta?
4. Are any routes, labels, or flows still too internal, dev-like, or misleading?
5. Does the privacy positioning match the actual product behavior?
6. What are the highest-risk blockers before spending money on Play submission?
7. Which competitors are closest in audience and use case, and where does Divergify currently win or lag?

## Regenerating the packet artifacts

1. Start the local preview server for the app.
2. Run `scripts/capture_review_screenshots.sh`.
3. Confirm the screenshots under `output/playwright/review-packet/`.
4. Re-run any product review against the updated screenshots and current code.
