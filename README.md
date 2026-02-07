# Divergify Hub

This repo is for the Divergify app and is the deploy target for divergify.app.

Important:
- The website repo inside `active-site/` is NOT committed here.
- This repo will contain the app source in `apps/divergify-hub-app/`.

Deploy:
- Point Netlify at this repo root (or set base dir to `apps/divergify-hub-app`).
- Build: `npm ci && npm run build`
- Publish: `apps/divergify-hub-app/dist` (or `dist` if base dir is set).
