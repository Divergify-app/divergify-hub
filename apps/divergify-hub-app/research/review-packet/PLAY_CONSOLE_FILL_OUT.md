# Divergify Play Console Fill-Out Sheet

Date: 2026-03-18

This is the practical Play Console worksheet for the current Divergify Android app.

Use this together with:

- `PLAY_STORE_COPY.md`
- `research/review-packet/PLAY_DATA_SAFETY_DRAFT.md`
- `APP_STORE_PATH.md`

## Main store listing

Recommended values:

- App name: `Divergify`
- Default language: `English (United States)` if that is your primary listing language
- App category: `Productivity`

Short description:

`For brains that zig when the world zags. Local-first planning and focus help.`

Full description:

Use the current text in `PLAY_STORE_COPY.md`.

Contact details:

- Contact email: `chaoscontrol@divergify.app`
- Website: `https://divergify.app`
- Privacy policy URL: `https://divergify.app/privacy.html`

## App access

Recommended answer:

- `No special access instructions required`

Reason:

- The current Android app does not require login, account creation, invite code, subscription activation, or reviewer credentials to reach its core functionality.

Current evidence:

- No account flow is present in the shipped app routes.
- Support opens a `mailto:` link or public website pages.

If Play Console asks whether all functionality is available without special access:

- Recommended answer: `Yes`

Important nuance:

- This is based on the current codebase. If you later gate features behind an account, closed beta wall, or server-side entitlement, update this answer.

## Ads

Recommended answer:

- `No, this app does not contain ads`

Reason:

- No ad SDK or ad placement flow is present in the current app dependencies or code.

## Data safety

Use `research/review-packet/PLAY_DATA_SAFETY_DRAFT.md` as the source of truth.

Recommended top-level answers:

- Does the app collect user data: `Yes`
- Is any collected data shared: `No`
- Is all collected data encrypted in transit: `Yes`, only if the release build uses an HTTPS backend for optional assist
- Do users have a deletion path: `Yes`

Recommended declared data types:

1. `Other user-generated content`
2. `Other in-app messages`

Recommended properties for both:

- Collected: `Yes`
- Shared: `No`
- Optional: `Yes`
- Purpose: `App functionality`
- Processed ephemerally: `No`

## App content

### Target audience

Recommended guardrail:

- Do not target children under 13 in the current listing.

Reason:

- The current public privacy policy states: Divergify is not directed to children under 13.

If Play Console asks for audience bands:

- Use the audience range that matches your actual intended market.
- Exclude under-13 targeting unless the product, legal copy, and moderation posture change.

### Content rating

Recommended approach:

- Complete the IARC questionnaire honestly inside Play Console.
- Do not force a target rating in advance.

Current product guidance:

- The app is a productivity/support tool, not a public social network.
- The shipped app does not contain gambling, explicit sexual content, graphic violence, or drug sales content.
- It does include freeform user text entry and sidekick chat, so answer communication or user-generated-text questions based on the actual in-app behavior.

### News apps

Recommended answer:

- `No`

Reason:

- Divergify is not a news app.

### Health features / medical posture

Recommended posture:

- Treat Divergify as a productivity app, not a medical or healthcare app, in the current submission.

Reason:

- Current copy explicitly says productivity support only, not medical advice, diagnosis, or treatment.

### Government / finance / dating / gambling

Recommended answer:

- `No` for those declarations, unless the product scope changes.

## Release notes

Suggested first release note:

`Initial Android release of Divergify: local-first planning, Brain Dump capture, habits, focus sessions, sidekicks, and privacy controls.`

## Before clicking submit

1. Build the release with a hosted HTTPS assist backend.
   - Example:
     `VITE_API_BASE_URL=https://divergify-hub-beta-jess.netlify.app npm run android:release`
2. Re-test Tin Foil Hat on the release build.
3. Open the privacy and contact URLs from the app on a real Android device.
4. Send one real support email to confirm delivery.
5. Upload a compliant app icon, feature graphic, and phone screenshots.

## What not to claim

Do not claim these in the listing or console unless you ship them:

- voice input
- text-to-speech
- full cloud sync
- subscriptions
- community/social features
- production-grade reminders/notifications
- medical care or diagnosis

## Source references

- Store copy source: `PLAY_STORE_COPY.md`
- Data safety source: `research/review-packet/PLAY_DATA_SAFETY_DRAFT.md`
- Public privacy policy: `https://divergify.app/privacy.html`
- Public contact page: `https://divergify.app/contact.html`
- Official Play setup help: `https://support.google.com/googleplay/android-developer/answer/9859152`
