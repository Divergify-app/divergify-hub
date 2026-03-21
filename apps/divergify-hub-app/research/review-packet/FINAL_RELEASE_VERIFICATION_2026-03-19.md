# Divergify Final Release Verification

Date: 2026-03-21

This note records what was verified for the current Play submission package and what still requires a physical-device pass.

## Verified

### Release artifacts

- Android App Bundle rebuilt successfully:
  - `android/app/build/outputs/bundle/release/app-release.aab`
- Release APK rebuilt successfully:
  - `android/app/build/outputs/apk/release/app-release.apk`

Build command used:

- `VITE_API_BASE_URL=https://divergify-hub-beta-jess.netlify.app ./scripts/build_android_release.sh`

Artifact timestamps:

- AAB: `2026-03-21 15:45:12 -0400`
- APK: `2026-03-21 15:45:13 -0400`

Checksums in the assembled submission packet:

- `app-release.aab`
  - `e74f77c4a5bdb981aaae9fa5b55e139d4ab2a2714c27372f4f125a138b69cf29`
- `app-release.apk`
  - `b3587f0d24f30313920f925ada26843d36ad85c6e19353b555854e6dfeaf2717`

### Android release config

Verified from the Android project:

- Application ID:
  - `app.divergify.hub`
- Version:
  - `versionCode 2`
  - `versionName 0.2.0`
- SDK targets:
  - `minSdkVersion 22`
  - `targetSdkVersion 35`
  - `compileSdkVersion 35`
- Android backups are disabled:
  - `android:allowBackup="false"`
- Release signing config is present and points to the upload keystore.
- `./gradlew :app:signingReport` confirmed a real release signing entry, not just debug signing.

### Hosted assist backend in shipped bundle

- The built web bundle contains the hosted HTTPS backend URL:
  - `https://divergify-hub-beta-jess.netlify.app`
- The shipped bundle does not rely on a localhost or emulator-only API base for optional assist.
- The hosted assist endpoint responded successfully to a live POST request during verification.

### Public privacy and contact links

Verified from the app code and public URLs:

- Support route loaded at `/feedback`
- `Open privacy policy` points to:
  - `https://divergify.app/privacy.html`
- `Open contact page` points to:
  - `https://divergify.app/contact`
- Both public URLs returned HTTP `200`.

### Support email wiring

Verified from the app support route:

- `Email support` points to:
  - `mailto:chaoscontrol@divergify.app?subject=Divergify%20support`

Verified at the domain level:

- `divergify.app` has Proton MX records:
  - `mail.protonmail.ch`
  - `mailsec.protonmail.ch`
- SMTP port 25 on both Proton MX hosts was reachable from this machine.

Interpretation:

- The support email domain is configured to receive mail.
- This is stronger than just having a `mailto:` link, but it is still not the same as confirming one real support message arrived in the inbox.

### First-screen clarity pass

Verified in source and compiled bundle:

- Today mode no longer forces the full task editor open when nothing is selected.
- The right panel now shows a `Start here` guidance card first, with direct actions for:
  - selecting the anchor task
  - starting focus
  - asking a sidekick
  - opening Brain Dump

Interpretation:

- This is a low-risk clarity improvement for first use and overload moments.
- It reduces the amount of editing chrome shown before the user has picked a task.

### Listing assets

Verified outputs:

- High-res icon:
  - `output/playwright/play-store/branding/hi-res-icon-512.png`
  - `512 x 512`
- Feature graphic:
  - `output/playwright/play-store/branding/feature-graphic-1024x500.png`
  - `1024 x 500`
- Phone screenshots:
  - `output/playwright/play-store/phone/*.png`
  - each `1080 x 1920`

## Not fully verified here

### Physical Android device install/run

Not verified in this environment.

Reason:

- No `adb` binary was available on the current shell path.
- No connected Android device or emulator was available through the local CLI.

### Final in-app manual checks on a phone

Still recommended:

1. Install the release build from the generated package.
2. Open Today and confirm the new `Start here` panel feels clearer on first load.
3. Open the Support screen on the phone.
4. Tap the privacy link and confirm it opens correctly.
5. Tap the contact link and confirm it opens correctly.
6. Tap the support email button and send one real message to confirm inbox delivery.
7. Toggle Tin Foil Hat on and off and sanity-check Sidekicks, Magic Tasks, and Lab.
8. Test Brain Dump once with typing and once with voice capture if the device/browser exposes the speech button.
9. Test one calendar handoff and one Waze handoff from a task with date/location data.

### Open follow-up

- `https://divergify.app/community` currently returns HTTP `404`.
- The main shipped app does not expose that route in navigation right now, so this is not a Play blocker by itself.
- Do not use that URL yet as a beta/community destination until the page exists.

## Submission package location

Submission package assembled at:

- `/home/jessibelle/Divergify/release-assets/google-play/Play_Submission`

Includes:

- bundle
- branding graphics
- phone screenshots
- Play Console docs
- checksums
