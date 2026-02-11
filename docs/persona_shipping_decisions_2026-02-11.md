# Persona Shipping Decisions (2026-02-11)

## Product Decision
- Ship a local-first sidekick system as the default path.
- Keep cloud LLM assist optional and additive, never required for core task/habit/focus flows.
- Do not place provider API keys in the browser app.

## Why
- Core flows must work even when users are offline, overstimulated, or privacy-sensitive.
- Tin Foil mode promise only holds if local functionality remains useful without cloud calls.
- Browser-exposed API keys are not acceptable for production.

## Technical Decisions
1. Core sidekick behavior
- Use deterministic local persona engine for check-ins, nudges, and chat guidance.
- Bind stimulation slider to real behavior:
  - smaller step sizes when overloaded
  - stronger calming constraints in high-support mode
  - longer default focus sprints at baseline

2. Cloud assist architecture (optional)
- If cloud assist is enabled, call a server endpoint from the app.
- Server holds provider credentials and enforces limits/safety.
- Client receives structured outputs only (for example: task breakdown lists).

3. Tin Foil mode contract
- Block cloud-assist calls in app code.
- Keep local fallback tools available (sorting, breakdown heuristics, sidekick guidance).
- Communicate clearly that this is application-level privacy mode, not network firewalling.

4. Non-JS fallback
- Keep a minimal non-JS fallback panel in `index.html` with a manual workflow.
- Treat this as graceful degradation, not full feature parity.

## External References (verified 2026-02-11)
- OpenAI API keys should not be deployed in client-side environments:
  - https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
- OpenAI API data usage policy overview:
  - https://platform.openai.com/docs/guides/your-data
- Non-JS `<noscript>` behavior reference:
  - https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/noscript
