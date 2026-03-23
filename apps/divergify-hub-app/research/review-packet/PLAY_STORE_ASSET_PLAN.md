# Divergify Play Store Asset Plan

Date: 2026-03-18

This is the concrete Play Store asset status for the current Divergify app.

## What exists right now

Existing research screenshots:

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

Existing in-app brand assets:

- `public/brand-north-star.png`
- `public/brand-wordmark-clean.png`
- `public/icon-192.png`
- `public/icon-512.png`
- `public/icon-512-maskable.png`

## What is submission-ready vs not

### Research packet screenshots

Status: `Useful for review, not directly submission-ready`

Reason:

- Most of the current packet screenshots are very tall full-page captures.
- Google Play requires screenshots where the longest side is not more than 2x the shortest side.

Examples from the current packet:

- `02-today.png` is `430 x 6004`
- `03-planner.png` is `430 x 5152`
- `08-settings.png` is `430 x 2352`

Those are valid research captures but not valid Play listing screenshots.

### App icon

Status: `Still needs final Play export review`

Reason:

- The in-app constellation mark is back, but the final store icon package should be reviewed as a dedicated Play asset, not assumed from app runtime assets.

### Feature graphic

Status: `Still missing as a final Play asset`

Required spec from Google Play:

- `1024 x 500`
- `JPEG or 24-bit PNG`
- `No alpha`

### Phone screenshots

Status: `Can now be generated from the local app`

New generation path:

- `scripts/capture_play_store_screenshots.sh`

Output directories:

- raw viewport captures: `output/playwright/play-store/raw`
- Play-sized phone screenshots: `output/playwright/play-store/phone`

## First recommended screenshot set

Use this order for the first phone listing pass:

1. `01-onboarding.png`
   - shows first-launch setup and support framing
2. `02-today.png`
   - shows the main daily planning view
3. `03-planner.png`
   - shows task organization depth
4. `04-brain-dump.png`
   - shows fast capture for messy input
5. `05-sidekicks.png`
   - shows the support/sidekick angle
6. `06-settings.png`
   - shows privacy controls and local-first controls

These are product-facing screenshots.

Do not lead the Play listing with:

- support page
- privacy page
- long legal text
- debug or dev-looking states

## Brand direction for store assets

Use the approved direction the product owner has been consistent about:

- North Star icon
- light cream wordmark
- dark navy background
- human, grounded tone

Avoid:

- neon AI-generic effects
- tiny overlay text
- duplicate messaging across every screenshot
- any icon variant the product owner has already rejected

## What to create next

### Needed immediately

1. Final Play app icon export using the approved North Star icon
2. Feature graphic built from the approved North Star + wordmark lockup
3. At least 4 compliant phone screenshots

Current generated outputs:

- `output/playwright/play-store/branding/hi-res-icon-512.png`
- `output/playwright/play-store/branding/feature-graphic-1024x500.png`
- `output/playwright/play-store/phone/01-onboarding.png`
- `output/playwright/play-store/phone/02-today.png`
- `output/playwright/play-store/phone/03-planner.png`
- `output/playwright/play-store/phone/04-brain-dump.png`
- `output/playwright/play-store/phone/05-sidekicks.png`
- `output/playwright/play-store/phone/06-settings.png`

### Good second pass

1. Short screenshot captions localized per listing language
2. Cleaner crops for calendar/focus/habits as alternates
3. Optional YouTube preview video only if it adds clarity

## Official spec notes

Google Play preview asset guidance:

- Screenshots:
  - minimum 320 px
  - maximum 3840 px
  - longest side cannot be more than 2x the shortest side
- Feature graphic:
  - `1024 x 500`
  - `JPEG or 24-bit PNG`
  - `No alpha`

Official source:

- `https://support.google.com/googleplay/android-developer/answer/1078870`
- `https://support.google.com/googleplay/android-developer/answer/9866151`

## Decision summary

Right now the asset problem is not "we have nothing."

It is:

- we have useful review material
- we have an asset-generation path
- we still need the final Play icon and feature graphic
- we need to use Play-compliant phone screenshots, not the long research captures
