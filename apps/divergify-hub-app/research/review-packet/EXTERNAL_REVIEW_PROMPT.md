Use this prompt with Gemini, ChatGPT, Claude, or another reviewer that can inspect a GitHub repo and browse the web.

---

You are reviewing the current Divergify Android app build for product quality, positioning, and app-store readiness.

Use the repository files and screenshot packet as the ground truth. Do not invent features that are not directly visible in code, screenshots, or included docs.

Start with these files:

- `research/review-packet/RESEARCH_PACKET.md`
- `PLAY_STORE_COPY.md`
- `APP_STORE_PATH.md`
- `src/App.tsx`
- `src/routes/Shell.tsx`
- `src/routes/Onboarding.tsx`
- `src/routes/Today.tsx`
- `src/routes/Tasks.tsx`
- `src/routes/Calendar.tsx`
- `src/routes/BrainDump.tsx`
- `src/routes/Focus.tsx`
- `src/routes/Habits.tsx`
- `src/routes/Sidekicks.tsx`
- `src/routes/Settings.tsx`
- `src/routes/Feedback.tsx`
- `src/routes/LegalPrivacy.tsx`
- `src/components/TaskWorkspace.tsx`
- `src/state/store.ts`
- `src/state/sessionState.tsx`

Use these screenshots:

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

Research current competitors on the live web before comparing. Focus on the most relevant products for neurodivergent-friendly planning, ADHD support, gentle productivity, and task breakdown. Use current sources. Prefer official product sites, current app-store pages, and current pricing/feature pages.

At minimum, evaluate Divergify against the most relevant overlap among:

- Finch
- Tiimo
- Goblin Tools
- Todoist
- Structured
- Routine
- Sunsama

Deliver:

1. A one-paragraph plain-English summary of what Divergify currently is.
2. A table of shipped features vs. obvious gaps.
3. A UX/brand assessment based on the screenshots.
4. A competitor comparison with clear “better than / worse than / different from” judgments.
5. A launch-readiness verdict:
   - Ready for Play internal testing
   - Ready for closed testing
   - Ready for production submission
   - Not ready
6. The top five blockers before paying for store submission.
7. The top five strengths worth leaning into in marketing.
8. Any misleading copy, risky claims, or privacy/data-safety concerns.

Constraints:

- Treat the current build as local-first unless direct evidence shows otherwise.
- Do not assume cloud sync, voice features, rewards systems, or social/community depth unless directly proven.
- Call out unresolved brand issues if the screenshots show them.
- Be direct. Avoid generic “promising concept” language.

---

Optional follow-up prompt:

“Now take the same evidence and rewrite the Google Play short description, full description, and first four screenshot captions so they match the real app instead of the aspirational roadmap.”
