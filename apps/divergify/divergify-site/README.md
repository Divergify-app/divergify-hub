# Divergify Full Site — Linux + Netlify Ready
Production URL: https://www.divergify.app
Stripe wired with TEST key (works end-to-end). Swap to live key later.

Dev: npm i && npm run dev
Deploy: netlify deploy --build --prod

## Voice MVP API (Takota)
- Endpoint: `POST /ai/voice`
- Env: set `OPENAI_API_KEY` (required) and optionally `OPENAI_ORG_ID` in Netlify/locals.
- Payload: `{ persona:"takota", convoId, transcript, device:"mobile", clientSettings?:{ mute?:boolean, speed?:number } }`
- Streamed SSE frames: incremental `{ text, speak, traceId }`; final frame `{ done:true, text, speak, ssml:null, traceId }`.
- Model: `gpt-4o-mini` (fallback `gpt-4.1-mini`), `max_output_tokens:220`, guardrails baked server-side for low-stim, short replies.
- Sample:
```bash
curl -N -X POST http://localhost:3000/ai/voice \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"persona":"takota","convoId":"demo-1","transcript":"give me one tiny next step to start dishes","device":"mobile"}'
```
