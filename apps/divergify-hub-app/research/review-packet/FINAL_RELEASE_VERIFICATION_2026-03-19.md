# Divergify Final Release Verification

Date: 2026-03-19

This note records what was verified for the current Play submission package and what still requires a physical-device pass.

## Verified

### Release artifacts

- Android App Bundle rebuilt successfully:
  - `android/app/build/outputs/bundle/release/app-release.aab`
- Release APK rebuilt successfully:
  - `android/app/build/outputs/apk/release/app-release.apk`

Build command used:

- `VITE_API_BASE_URL=https://divergify-hub-beta-jess.netlify.app npm run android:release`

Artifact timestamps:

- AAB: `2026-03-19 12:59:20 -0400`
- APK: `2026-03-19 12:59:21 -0400`

### Hosted assist backend in shipped bundle

- The built web bundle contains the hosted HTTPS backend URL:
  - `https://divergify-hub-beta-jess.netlify.app`
- The shipped bundle does not rely on a localhost or emulator-only API base for optional assist.

### Public privacy and contact links

Verified from the running app support route with Playwright:

- Support route loaded at `/feedback`
- `Open privacy policy` points to:
  - `https://divergify.app/privacy.html`
- `Open contact page` points to:
  - `https://divergify.app/contact.html`
- Both public links opened successfully in new browser tabs from the app context.

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
2. Open the Support screen on the phone.
3. Tap the privacy link and confirm it opens correctly.
4. Tap the contact link and confirm it opens correctly.
5. Tap the support email button and send one real message to confirm inbox delivery.
6. Toggle Tin Foil Hat on and off and sanity-check Sidekicks, Magic Tasks, and Lab.

## Submission package location

Desktop package assembled at:

- `/home/jessibelle/Desktop/Divergify_Play_Submission`

Includes:

- bundle
- branding graphics
- phone screenshots
- Play Console docs
- checksums
