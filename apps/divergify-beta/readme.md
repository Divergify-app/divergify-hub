# Divergify App Beta (Expo)

Neurodivergent-first mobile companion with calendar rituals, route planning, shopping focus mode, Beat your baseline blocker, and nudge assistant. Everything is dark theme, offline-first, and runs entirely on-device (AsyncStorage).

## Quickstart

```bash
npm install -g expo-cli                   # only once
cd /home/jessibelle                       # or wherever you keep projects
expo init divergify-beta --template blank # already done
# replace the generated files with this folder's contents
cd divergify-beta
npm install
expo start
```

## Feature Highlights

- **Orbit Calendar:** log tasks/appointments per day, mark body-double sessions, keep receipts stacked in one view.
- **Route Planner:** Google Maps Directions with saved runs and current-location pin. Update `app.json` \+ `web/manifest.json` with your real key before shipping.
- **Shopping Focus Mode:** intention-based list with category filters, done-progress bar, and friendly guardrails against impulse buys.
- **Beat your baseline:** gamified focus timer with streak tracking, baseline auto-adjustment, and celebratory receipts.
- **Nudge Assistant:** 5+ blunt/funny behavioral nudges, shuffle/pin/share flow for daily hype.
- **PWA ready:** run `expo build:web` and deploy the static output to `divergify.app` as a fallback.

## Build & Ship

```bash
expo start            # live reload via Expo Go app or web preview
expo build:android    # generate APK/AAB (Expo account required)
expo build:web        # emits web-build/ for hosting at divergify.app
```

Upload the finished APK/Web build to `divergify.app/download` when ready. Replace the placeholder Google Maps API key (`AIzaSyD-Your-Free-Key-Here`) in `app.json` before going public.

## Takota Voice MVP

- Env (keep out of git): `EXPO_PUBLIC_AI_BASE_URL`, `EXPO_PUBLIC_TAKOTA_GUARDRAIL`, `EXPO_PUBLIC_TAKOTA_MAX_RESPONSE_CHARS`.
- Endpoint: POST `${EXPO_PUBLIC_AI_BASE_URL}/ai/voice` with `{ persona, convoId, transcript, device:"mobile", clientSettings?:{ mute?:boolean, speed?:number } }`.
- Streaming frames: `{ text, speak, traceId }` deltas, final `{ done:true, text, speak, ssml:null, traceId }`.
- Requires dev client (`expo run:ios` / `expo run:android`) for `@react-native-voice/voice`.
