# App store path

This app is now running as a branded Capacitor Android project, not just a web app scaffold.

Already in this repo:
- Vite/React/TypeScript app build
- PWA manifest + service worker
- Capacitor Android project synced in `android/`
- Branded launcher icons, splash assets, and theme colors
- Debug APK build output at:
  `/home/jessibelle/Divergify/active/divergify-hub/apps/divergify-hub-app/android/app/build/outputs/apk/debug/app-debug.apk`
- Signed release APK build output at:
  `/home/jessibelle/Divergify/active/divergify-hub/apps/divergify-hub-app/android/app/build/outputs/apk/release/app-release.apk`
- Signed release AAB build output at:
  `/home/jessibelle/Divergify/active/divergify-hub/apps/divergify-hub-app/android/app/build/outputs/bundle/release/app-release.aab`

Public beta endpoints:
- Hosted beta app:
  `https://divergify-hub-beta-jess.netlify.app`
- Hosted beta feedback lane:
  `https://divergify-hub-beta-jess.netlify.app/feedback`
- Hosted APK download:
  `https://divergify-hub-beta-jess.netlify.app/downloads/divergify-hub-beta.apk`
- AI endpoints are hosted on the same Netlify beta site via `/api/ai/*`
- Beta feedback is captured by Netlify Forms using the `beta-feedback` form on the hosted site

Store submission references:
- Public privacy policy URL:
  `https://divergify.app/privacy.html`
- Vetted Google Play listing draft:
  `/home/jessibelle/Divergify/active/divergify-hub/apps/divergify-hub-app/PLAY_STORE_COPY.md`
- In-app support route now points users to email/privacy/contact instead of the beta web form

Local test flow:
1. Run `npm run build`
2. Run `npm run cap:sync android`
   - This step is required after every web build so `android/app/src/main/assets/public/` is not left with stale files.
3. Build Android with:
   `JAVA_HOME=/home/jessibelle/.local/jdk-17 ANDROID_SDK_ROOT=/home/jessibelle/.local/android-sdk ANDROID_HOME=/home/jessibelle/.local/android-sdk ./gradlew assembleDebug`
4. Install the APK on a device:
   `adb install -r /home/jessibelle/Divergify/active/divergify-hub/apps/divergify-hub-app/android/app/build/outputs/apk/debug/app-debug.apk`

Beta/release build flow:
1. Build or redeploy the hosted beta site:
   `npx netlify deploy --prod --build`
2. Re-sync Android with the hosted beta backend:
   `VITE_API_BASE_URL=https://divergify-hub-beta-jess.netlify.app npm run cap:sync android`
3. Build signed release artifacts:
   `JAVA_HOME=/home/jessibelle/.local/jdk-17 ANDROID_SDK_ROOT=/home/jessibelle/.local/android-sdk ANDROID_HOME=/home/jessibelle/.local/android-sdk ./gradlew assembleRelease bundleRelease`
4. Optional: publish the release APK on the beta site:
   `mkdir -p dist/downloads && cp android/app/build/outputs/apk/release/app-release.apk dist/downloads/divergify-hub-beta.apk`
   `npx netlify deploy --prod --no-build --dir=dist --functions=netlify/functions`

Still needed before Play submission:
- Google Play Console listing assets (screenshots, feature graphic)
- Upload the signed `.aab` to a Play test track
- Deploy and verify the updated privacy-policy page at the public URL above
- Complete Play Data Safety and app access disclosures so they match the current local-first plus optional-cloud-assist behavior
- Decide whether to harden or authenticate the public AI proxy before open testing at scale
