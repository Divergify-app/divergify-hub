# Divergify Play Data Safety Draft

Date: 2026-03-18

This is the conservative Google Play Data Safety draft for the current Divergify Android app codebase.

Scope:

- App repo: `apps/divergify-hub-app`
- Current Android manifest: `android/app/src/main/AndroidManifest.xml`
- Current privacy route: `src/routes/LegalPrivacy.tsx`
- Current public privacy policy: `https://divergify.app/privacy.html`

This draft is intentionally conservative. It does not try to exploit the "ephemeral processing" exception unless the backend and service-provider retention story is documented tightly enough to defend in a Play review.

## Recommended top-level answers

### Does the app collect or share required user data types?

- Collects data: `Yes`
- Shares data: `No`

Reason:

- Optional assist features send user-entered content off device when the user triggers them and Tin Foil Hat is off.
- Those transfers go to service providers acting on your behalf, which Google says do not need to be declared as "sharing."

### Is all collected data encrypted in transit?

- Recommended answer: `Yes`

Condition:

- Only if the release build points optional assist at an `https://` backend.
- Do not submit a store build wired to `http://` dev URLs.

### Do you provide a way for users to request deletion of their data?

- Recommended answer: `Yes`

How to support that answer:

- Local app data: users can reset the app in Settings or clear app storage on device.
- Off-device support or waitlist data: users can email `chaoscontrol@divergify.app` for deletion.

### Should you rely on the "processed ephemerally" exception?

- Recommended answer: `No`

Reason:

- Google says ephemeral processing only applies when data is stored only in memory and retained no longer than necessary for the live request.
- Divergify's optional assist path goes through Netlify functions and an external model provider. The app code sets `store: false` on the OpenAI Responses call, but this alone is not strong enough to claim the full ephemeral exception in Play unless you are also certain about backend and provider retention and logging behavior.

Safer position:

- Disclose the optional assist data collection in the form.
- Keep the privacy policy honest about local-first defaults and optional off-device assist.

## Recommended data types to declare

### 1. Other user-generated content

- Collected: `Yes`
- Shared: `No`
- Processed ephemerally: `No`
- Required or optional: `Users can choose whether this data is collected`
- Purpose: `App functionality`

Why:

- Assisted Sort in Lab sends freeform brain-dump text to `/api/ai/sort`.
- Magic Tasks sends task text to `/api/ai/breakdown`.
- Sidekick assist sends onboarding answers, task summaries, counts, preferences, and recent chat context to `/api/ai/sidekick` when the user triggers sidekick help and Tin Foil Hat is off.

Evidence in code:

- `src/shared/aiClient.ts`
- `src/routes/Lab.tsx`
- `src/routes/MagicTasks.tsx`
- `src/shared/sidekickAssist.ts`
- `netlify/functions/sort.ts`
- `netlify/functions/breakdown.ts`
- `netlify/functions/sidekick.ts`

Examples included in this category:

- brain-dump text
- task text for breakdowns
- onboarding reason / primary goal / focus area / anchor task
- open task summaries such as title, project, due date, estimate, and location text
- recent sidekick context that is sent to optional assist

### 2. Other in-app messages

- Collected: `Yes`
- Shared: `No`
- Processed ephemerally: `No`
- Required or optional: `Users can choose whether this data is collected`
- Purpose: `App functionality`

Why:

- User sidekick messages and recent chat history are sent to the optional sidekick assist endpoint when the user asks the sidekick for help and Tin Foil Hat is off.

Evidence in code:

- `src/shared/sidekickAssist.ts`
- `src/components/SidekickDrawer.tsx`
- `netlify/functions/sidekick.ts`

Examples included in this category:

- the user's current sidekick prompt
- recent chat turns sent as context for the next sidekick reply

## Data types I do not recommend declaring from the current app build

These are judgment calls based on the current code. If the product scope changes, revisit them.

### Name / email / phone / user IDs

- Recommended declaration: `No`

Reason:

- The Android app does not submit a feedback form or create accounts in the current release.
- Support is currently a `mailto:` link and external website link, not an in-app account or profile submission flow.

### Location

- Recommended declaration: `No`

Reason:

- The app does not request Android location permission.
- The optional task `location` field is user-entered task metadata, not device-location access.
- From the current code, this is better treated as part of "Other user-generated content" rather than as a standalone location collection claim.

### Health info / fitness info

- Recommended declaration: `No`

Reason:

- The product positions itself as productivity support, not diagnosis or treatment.
- The current schemas do not purposefully collect structured medical or diagnosis data.
- Open-ended text can contain sensitive user content, but from the code it is still better classified as "Other user-generated content."

Note:

- If you later add symptom tracking, diagnosis prompts, medication logs, or mood/mental-health journaling as an explicit feature, revisit this immediately.

### Contacts / calendar / photos / videos / audio / files and docs

- Recommended declaration: `No`

Reason:

- The app does not request those Android permissions in the current manifest.
- It can create exports and integration links, but it does not read the user's contacts, calendar, media library, or files as an off-device collection flow.

### App interactions / search history / installed apps / diagnostics / crash logs / device or other IDs

- Recommended declaration: `No`

Reason:

- No analytics SDK, crash SDK, ad SDK, or installed-apps collector is present in the current app code or dependencies.
- I do not see code collecting persistent device identifiers or interaction telemetry for analytics or marketing.

## Manual verification checklist before you fill the Play form

1. Confirm the release build uses a hosted HTTPS API base for optional assist.
   - Expected: `VITE_API_BASE_URL=https://...`
   - If unset, optional assist can fail in Capacitor instead of reaching your backend.
2. Confirm Tin Foil Hat blocks optional assist network calls in the release build.
   - Test Sidekicks, Magic Tasks, and Lab with Tin Foil Hat on and off.
3. Confirm the public privacy policy and contact URLs open from the app.
   - `https://divergify.app/privacy.html`
   - `https://divergify.app/contact.html`
4. Send one real support email to confirm it lands in `chaoscontrol@divergify.app`.
5. Re-check dependencies before final submission.
   - If you add analytics, crash reporting, login, notifications, or new SDKs, this draft can change.

## What this means for your privacy goals

You do not need to make the app less private.

The practical choices are:

- If you want the strongest privacy posture, keep the app local-first and disclose only the optional assist collection that users explicitly trigger.
- If you want the Play listing to say no user data is collected, then you need to remove or fully disable optional cloud assist in the store build.

Those are product choices, not policy traps.

## Recommended exact Play-console posture

If you ship the current local-first app with optional hosted assist:

- Data collected: `Yes`
- Data shared: `No`
- Data types:
  - `Other user-generated content`
  - `Other in-app messages`
- For both:
  - Collected: `Yes`
  - Shared: `No`
  - Optional: `Yes`
  - Purpose: `App functionality`
  - Ephemeral: `No`
- Security:
  - encrypted in transit: `Yes`, if the release build uses HTTPS
  - deletion request available: `Yes`

## Source notes

Primary local code sources:

- `src/shared/aiClient.ts`
- `src/shared/sidekickAssist.ts`
- `src/routes/LegalPrivacy.tsx`
- `src/routes/Feedback.tsx`
- `src/routes/Settings.tsx`
- `src/state/store.ts`
- `src/state/types.ts`
- `android/app/src/main/AndroidManifest.xml`
- `netlify/functions/_shared/ai.ts`
- `netlify/functions/sort.ts`
- `netlify/functions/breakdown.ts`
- `netlify/functions/sidekick.ts`
- `APP_STORE_PATH.md`

Primary official guidance:

- Google Play Data Safety help:
  `https://support.google.com/googleplay/android-developer/answer/10787469?hl=en`
- Android Developers guidance for preparing your Data Safety answers:
  `https://developer.android.com/privacy-and-security/declare-data-use`
