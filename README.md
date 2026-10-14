# Divergify Hub — conversation-first review branch

Jess explicitly requested a return to this app experience on 2026-10-14. This branch contains the first conversation-first pass. It does not change the production site or retire the separate mobile app.

## Where the code lives

| Purpose | Repository / folder |
| --- | --- |
| This conversation-first app change | `Divergify-app/divergify-hub` → `apps/divergify-hub-app` |
| Original Expo beta reference | This repo → `apps/divergify-beta`; standalone January snapshot: `jessibellestarr/divergify-beta` |
| Separate Expo mobile app and October Takota engine | `Divergify-app/divergify-mobile-app` |
| Public explanatory website | `Divergify-app/Divergify_Website` |

Read `AI_HANDOFF.md` before continuing. Do not silently move this work to another repository. The existing website copy and mobile engine are separate from this review branch.

## Run this branch

```sh
cd apps/divergify-hub-app
npm ci
npm run dev
```

Build with `npm run build`; test with `npm test`. Voice requires a supported browser, microphone permission, and HTTPS or localhost. Basic local replies are not live AI. Outside calendar integration and background reminders are not implemented.

## Historical retirement notice

The following notice explains the previous direction. Jess’s October 14 instruction supersedes its prohibition on editing the Hub for this review branch. Its platform claims are historical, not a newly verified technical assessment.

---

# ⛔ ARCHIVED — DO NOT DEVELOP HERE

**This repo is retired as of June 2026.**

Active development has moved to:
> **[github.com/Divergify-app/divergify-mobile-app](https://github.com/Divergify-app/divergify-mobile-app)**

This repo is preserved as a reference only. Nothing here should be built, deployed, or modified.

## Why it was retired

`divergify-hub` was a React/Vite web app wrapped in Capacitor for Android — no iOS path, not a true native app. `divergify-mobile-app` is Expo/React Native, runs natively on iOS and Android, has a more complete feature set (Takota AI, Divergipedia, Dopamine Depot, Social agent), and is the only path to the App Store.

## If you want something from here

Read `ARCHIVED_REFERENCE.md` in this repo. It lists every hub-app feature worth porting to mobile-app, with file locations and priority ratings.

## Beta site

`https://divergify-hub-beta-jess.netlify.app` — stays live as a web preview. Do not redeploy.
