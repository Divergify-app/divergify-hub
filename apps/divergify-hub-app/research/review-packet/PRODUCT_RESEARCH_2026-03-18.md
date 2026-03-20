# Divergify Product Research

Date: March 18, 2026

## Bottom line

Divergify is not ready for a confident Google Play production submission yet.

It is close enough for internal testing now, and it is plausibly close to closed testing once the privacy/disclosure issue and store-asset package are cleaned up. The product already has a real, coherent core: brain dump, planner, calendar board, focus, habits, sidekicks, and local-first controls. What it does not yet have is the polish, clarity, and trust layer needed to compete with the stronger apps in this category on first impression.

## What Divergify currently is

Based on the current code and screenshot set, Divergify is a local-first planner for neurodivergent users who want less guilt, more structure, and support that stays practical. The strongest part of the product is not a single isolated tool. It is the combination of:

- quick capture
- task-first planning
- gentle support tuning
- breakdown help
- focus execution
- privacy controls

That combination is real in this build.

## What already feels strong

### 1. The product concept is differentiated

The app is not just another to-do list. It has a clear point of view:

- local-first by default
- built for neurodivergent friction, not generic “hustle”
- support should help without becoming another demanding feed

That is a credible niche.

### 2. The feature set is broader than the screenshots first suggest

The repo shows a meaningful core set, not a landing-page prototype:

- onboarding on first launch: `src/routes/Onboarding.tsx`
- today + planner workspace: `src/components/TaskWorkspace.tsx`
- calendar board with drag-and-drop scheduling: `src/routes/Calendar.tsx`
- brain dump parsing: `src/routes/BrainDump.tsx`
- focus timer and session history: `src/routes/Focus.tsx`
- habits tracking: `src/routes/Habits.tsx`
- sidekick personalities and local fallback: `src/routes/Sidekicks.tsx`, `src/shared/sidekickAssist.ts`
- local export/import and privacy settings: `src/routes/Settings.tsx`

### 3. The sidekick architecture is more defensible than “AI buddy” apps

This build does not fully depend on cloud AI. `src/shared/sidekickAssist.ts` falls back to local generation when cloud assist is unavailable or Tin Foil Hat is enabled. That is a strong product and trust decision.

### 4. The human tone is improving

The current copy is less synthetic than earlier directions. The best lines sound direct, grounded, and useful rather than “AI productivity assistant” generic.

## What currently weakens the product

### 1. Brand usage needs one consistent release pass

This is still a real release concern, but it is no longer “the logo is missing.”

The approved constellation mark is now back in the visible app shell alongside the light wordmark. That is the right direction. What still needs a last pass is consistency across:

- launcher icon
- tab/PWA icon
- store icon
- feature graphic
- screenshot framing

Related files:

- `src/components/BrandWordmark.tsx`
- `src/components/BrandMark.tsx`
- `public/icon.svg`

### 2. The mobile UI is too dense

The screenshot set shows long vertical screens with many cards, pills, and controls stacked immediately above the fold. The app feels information-rich, but also heavy.

Most obvious examples:

- `output/playwright/review-packet/02-today.png`
- `output/playwright/review-packet/08-settings.png`

The user benefit is there, but the cognitive load is still high for an app that is explicitly promising relief from overload.

### 3. Some labels are still too insider-ish

These controls are not self-explanatory on first glance:

- `Systems OFF`
- `Shades OFF`
- `Tin Foil Hat OFF`

They may make sense after repeated use, but they are weak first-impression labels. “Tin Foil Hat” is memorable, but it still needs plainer supporting language wherever store reviewers or new users encounter it.

### 4. The app is functionally real, but the product proof is still thin

Competitors in this space signal maturity with:

- sync across devices
- reminders/widgets
- stronger visual identity
- a clearer emotional hook
- better proof of adoption

Divergify has the core behavior, but not yet the same confidence layer.

## Readiness verdict

### Internal testing

Yes.

The build is real enough to put in front of trusted testers now.

### Closed testing

Almost, but not without fixing the privacy/disclosure issue below and finalizing the store asset package used in the Android build and submission materials.

### Production submission

No.

As of March 18, 2026, the product is not yet ready for a confident production Play submission.

## Top blockers before spending money on submission

### 1. Privacy/disclosure mismatch in Android backup behavior

This was the most important concrete blocker I found in code during the initial review.

The in-app privacy page says:

- “There is no automatic account sync or background cloud backup in this release.”

At review time, the Android manifest had:

- `android:allowBackup="true"` in `android/app/src/main/AndroidManifest.xml`

Per Android’s official backup documentation, apps with backup enabled can participate in automatic backup and restore, including cloud backup on supported devices. That creates a likely mismatch with the current privacy claim. This is an inference from the manifest plus Android’s documented default behavior, and it should be treated as a disclosure risk until explicitly resolved.

Update after the initial review:

- this has now been changed to `android:allowBackup="false"` in `android/app/src/main/AndroidManifest.xml`
- the release build still passes after the change

Sources:

- https://developer.android.com/identity/data/autobackup
- https://developer.android.com/guide/topics/manifest/application-element

### 2. Consistent icon and store brand assets

The visible shell brand is back on the right track. The remaining task is to make sure the same approved constellation system is used consistently for:

- launcher icon
- store icon
- feature graphic
- screenshot framing

Those assets still need to be treated as a final packaging pass before submission, even though the in-app shell now uses the approved constellation direction again.

### 3. Live public policy and support verification

The app points to:

- `https://divergify.app/privacy.html`
- `https://divergify.app/contact.html`
- `chaoscontrol@divergify.app`

Before submission, those public endpoints need to be live, accurate, and checked from the release build.

### 4. Store asset package is still missing

The repo now has a screenshot set for research:

- `output/playwright/review-packet/*.png`

But that is not yet the full Play Console asset package. A production submission still needs finalized screenshot selection, caption strategy, and a feature graphic.

### 5. The product still needs proof on real Android devices

Browser preview and release builds are good progress, but Play readiness depends on actual device confidence:

- startup behavior
- first-run onboarding
- export/import
- sidekick fallback behavior
- external links
- calendar integrations
- visual stability across screen sizes

## Competitor benchmark

## Tiimo

Closest competitor in audience and philosophy.

Tiimo positions itself as a visual AI planner with executive function support, visual planning, focus timer, to-do list, AI task breakdown, widgets, mood tracking, and sync across devices. Its site says it was built by and for neurodivergent people and that over half a million people use it.

Sources:

- https://www.tiimoapp.com/

Where Tiimo is ahead:

- stronger product-market fit proof
- more polished visual system
- sync and multi-device story
- clearer visual planning story
- more mature “executive function support” framing

Where Divergify is stronger:

- more privacy-forward local-first stance
- less polished but more grounded tone when it avoids AI-speak
- better potential fit for users who want practical planning support without a high-gloss wellness aesthetic

Verdict:

If a user wants a polished neurodivergent planner today, Tiimo currently looks safer. Divergify only wins if it leans hard into privacy, honesty, and lower-pressure support.

## Structured

Structured is the clearest mainstream planner comparison.

Its official site positions it as an all-in-one day planner, to-do list, focus timer, calendar, and habit tracker. It also claims 15M+ downloads and emphasizes a visual timeline, calendar import, weekly/monthly views, and access across devices.

Sources:

- https://structured.app/

Where Structured is ahead:

- stronger simplicity on first impression
- clearer visual-timeline signature
- broader mainstream adoption
- cleaner presentation of planning across devices

Where Divergify is stronger:

- more emotionally and cognitively specific positioning for neurodivergent users
- better support identity than a generic timeline planner
- stronger privacy angle

Verdict:

Structured currently wins on polish and clarity. Divergify wins only if the reviewer values neurodivergent-specific framing enough to overlook the lighter finish.

## Finch

Finch is not a planner-first competitor. It is a self-care and habit companion with strong retention mechanics.

Its help center shows goal buddies, streaks, seasonal events, friends/social features, and optional Finch Plus monetization around extra rewards and customization.

Sources:

- https://finchcare.com/
- https://help.finchcare.com/hc/en-us/articles/37936388919693-Goal-Buddies
- https://help.finchcare.com/hc/en-us/articles/37780200600589-Benefits-of-Finch-Plus
- https://help.finchcare.com/hc/en-us/articles/37780438941965-Seasonal-Event-Overview
- https://help.finchcare.com/hc/en-us/articles/38755205001869-Finch-Plus-Pricing

Where Finch is ahead:

- delight
- emotional stickiness
- social reinforcement
- gamification and retention
- mature premium loop

Where Divergify is stronger:

- more serious task-planning credibility
- less toy-like for users who dislike gamification
- better fit for “help me run my day” instead of “help me self-soothe into consistency”

Verdict:

Finch is the stronger companion product. Divergify is the stronger planner concept. They are adjacent, not identical.

## Goblin Tools

Goblin Tools is the cleanest comparison for Divergify’s breakdown and brain-dump utilities.

Its official site presents a suite of simple single-purpose tools such as Magic ToDo, Compiler, Estimator, and Formalizer. The About page says it is designed mostly for neurodivergent users and remains free on the web, supported by low-priced mobile apps.

Sources:

- https://goblin.tools/
- https://ios.goblin.tools/About

Where Goblin Tools is ahead:

- instant utility
- lower cognitive overhead
- sharper single-purpose framing
- stronger trust through simplicity

Where Divergify is stronger:

- integrated planner context
- persistent tasks, habits, focus, and settings
- more complete daily workflow

Verdict:

Goblin Tools is better at tiny utility moments. Divergify is better if the user wants those moments inside a broader planner.

## Todoist

Todoist is the mainstream task-management benchmark.

Its pricing page highlights reminders, list and board layouts, calendar layout, task duration, team features, integrations, and enterprise-grade compliance.

Sources:

- https://www.todoist.com/pricing

Where Todoist is ahead:

- reliability reputation
- integrations
- reminders
- collaboration and team support
- trust and maturity

Where Divergify is stronger:

- more differentiated audience focus
- more emotionally useful support framing for overwhelmed users
- less corporate, less generic

Verdict:

Todoist wins on infrastructure and maturity. Divergify wins only on niche empathy and local-first personality.

## Sunsama

Sunsama is a premium daily-planning competitor for professionals.

Its site and pricing pages emphasize guided planning, calendar sync, focus mode, auto-scheduling, weekly review, analytics, wide integrations, and premium pricing.

Sources:

- https://www.sunsama.com/
- https://www.sunsama.com/pricing
- https://www.sunsama.com/features/timeboxing

Where Sunsama is ahead:

- planning ritual maturity
- calendar/task integration depth
- high-confidence premium positioning
- cross-platform and integration breadth

Where Divergify is stronger:

- consumer accessibility
- ND-specific product story
- local-first privacy framing
- lower enterprise/business baggage

Verdict:

Sunsama is a much more mature work planner. Divergify should not try to out-Sunsama Sunsama.

## Routine

Routine is a work operating system, not a neurodivergent consumer planner.

Its pricing page highlights tasks, calendars, notes, contacts, natural language, integrations, offline mode, AI meeting notes, time tracking, collaboration, and enterprise/security layers.

Sources:

- https://routine.co/pricing

Where Routine is ahead:

- breadth
- integrations
- desktop/professional workflow depth
- enterprise posture

Where Divergify is stronger:

- warmth
- local-first privacy story
- clearer focus on personal execution friction

Verdict:

Routine is not the same category emotionally, but it raises the bar on perceived completeness.

## Strategic position

Divergify should not market itself as:

- a generic AI productivity assistant
- an all-purpose work operating system
- a gamified self-care pet

It should market itself as:

- a private, human, neurodivergent-friendly planner
- a tool for messy days and quick re-entry
- a calmer alternative to overbuilt productivity systems

That is the most believable lane.

## What I would do next

### Before submission

1. Resolve the Android backup/privacy mismatch.
2. Finalize the launcher/store icon set and screenshot visual system so the submission materials match the restored in-app brand.
3. Do one disciplined closed test on real Android devices.
4. Tighten the above-the-fold UI density on the Today and Settings screens.
5. Replace ambiguous control labels with plainer language or clearer helper text.

### For positioning

1. Lean into “local-first, no guilt, quick re-entry.”
2. Stop leading with “AI.”
3. Lead with Brain Dump, Today, Focus, and privacy control as the core story.
4. Treat Sidekicks as support flavor, not the whole product.

## Final verdict

As of March 18, 2026:

- Ready for internal testing: yes
- Ready for closed testing: almost
- Ready for production Play submission: no

The app has a real product inside it. The remaining work is not “invent the app.” It is “finish the trust layer.”
