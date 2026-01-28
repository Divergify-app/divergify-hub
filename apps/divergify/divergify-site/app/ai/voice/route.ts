import { NextRequest } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const OPENAI_URL = 'https://api.openai.com/v1/responses';
const MODEL = 'gpt-4o-mini';
const FALLBACK_MODEL = 'gpt-4.1-mini';
const MAX_OUTPUT_TOKENS = 220;
const TIMEOUT_MS = 12_000;
const DEFAULT_SPEAK = true;

const TAKOTA_GUARDRAIL = [
  'You are Takota, a neurodivergent-first assistant.',
  'Keep it low-stimulus, kind, and concise. Offer one helpful next step.',
  'Do not rewrite the user’s words.',
  'No shame, no coercion, no therapy or clinical claims.',
  'Keep outputs short, plain, and easy to say aloud.',
  'Responses must follow the JSON schema exactly.',
].join(' ');

const voiceSchema = {
  type: 'object',
  properties: {
    text: { type: 'string' },
    speak: { type: 'boolean' },
    ssml: { type: ['string', 'null'] },
    traceId: { type: 'string' },
  },
  required: ['text', 'speak', 'traceId'],
  additionalProperties: false,
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

const toSSE = (data: unknown) => encoder.encode(`data: ${JSON.stringify(data)}\n\n`);

const extractDeltaText = (chunk: any): string => {
  // Try common delta shapes from Responses API
  if (chunk?.delta?.output_text?.text) return String(chunk.delta.output_text.text);
  if (typeof chunk?.delta?.output_text === 'string') return chunk.delta.output_text;
  const outputArray = chunk?.delta?.output ?? chunk?.output ?? [];
  for (const out of outputArray) {
    if (out?.content) {
      for (const part of out.content) {
        if (typeof part?.text === 'string' && part.text.length) return part.text;
      }
    }
    if (typeof out?.text === 'string' && out.text.length) return out.text;
  }
  return '';
};

const isStreamDone = (payload: any) => {
  if (!payload) return false;
  if (payload === '[DONE]') return true;
  if (payload?.event === 'completion' || payload?.event === 'done') return true;
  if (payload?.status === 'completed') return true;
  return false;
};

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'OPENAI_API_KEY is not configured', traceId: null }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (_err) {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { persona = 'takota', convoId, transcript, device, clientSettings } = body ?? {};
  if (!transcript || typeof transcript !== 'string') {
    return new Response(JSON.stringify({ error: 'transcript is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (persona !== 'takota') {
    return new Response(JSON.stringify({ error: 'Only persona "takota" is supported' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const traceId = `takota-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const speakFlag = clientSettings?.mute === true ? false : DEFAULT_SPEAK;
  const speed = typeof clientSettings?.speed === 'number' ? clientSettings.speed : undefined;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  };
  if (process.env.OPENAI_ORG_ID) {
    baseHeaders['OpenAI-Organization'] = process.env.OPENAI_ORG_ID;
  }

  const userPrompt = [
    `Transcript: "${transcript.trim()}"`,
    device ? `Device: ${device}` : null,
    speed ? `Preferred speech rate: ${speed}` : null,
    speakFlag === false ? 'User muted TTS; keep speak=false.' : 'User allows TTS; speak=true.',
  ]
    .filter(Boolean)
    .join('\n');

  const requestPayload = {
    model: MODEL,
    stream: true,
    max_output_tokens: MAX_OUTPUT_TOKENS,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'takota_voice',
        schema: voiceSchema,
        strict: true,
      },
    },
    input: [
      {
        role: 'developer',
        content: [{ type: 'text', text: `${TAKOTA_GUARDRAIL} Trace ID: ${traceId}` }],
      },
      {
        role: 'user',
        content: [{ type: 'text', text: userPrompt }],
      },
    ],
  };

  const fetchWithModel = async (model: string) => {
    const payload = { ...requestPayload, model };
    return fetch(OPENAI_URL, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  };

  let upstream = await fetchWithModel(MODEL);
  if (!upstream.ok && upstream.status === 404) {
    upstream = await fetchWithModel(FALLBACK_MODEL);
  }

  if (!upstream.ok || !upstream.body) {
    clearTimeout(timeout);
    const errorBody = await upstream.text().catch(() => '');
    const status = upstream.status || 500;
    return new Response(
      JSON.stringify({
        error: `Upstream error (${status})`,
        detail: errorBody || 'No response body',
        traceId,
      }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const stream = new ReadableStream({
    async start(controllerStream) {
      const reader = upstream.body!.getReader();
      let buffer = '';
      let aggregated = '';

      const push = (data: unknown) => controllerStream.enqueue(toSSE(data));

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const evt of events) {
            const line = evt.trim();
            if (!line.startsWith('data:')) continue;
            const payloadRaw = line.replace(/^data:\s*/, '').trim();
            if (payloadRaw === '[DONE]') {
              push({ done: true, text: aggregated, speak: speakFlag, ssml: null, traceId });
              controllerStream.close();
              clearTimeout(timeout);
              return;
            }
            try {
              const parsed = JSON.parse(payloadRaw);
              const delta = extractDeltaText(parsed);
              if (delta) {
                aggregated += delta;
                push({ text: delta, speak: speakFlag, traceId });
              }
              if (isStreamDone(parsed)) {
                push({ done: true, text: aggregated, speak: speakFlag, ssml: null, traceId });
                controllerStream.close();
                clearTimeout(timeout);
                return;
              }
            } catch (_e) {
              // ignore malformed chunk
            }
          }
        }

        push({ done: true, text: aggregated, speak: speakFlag, ssml: null, traceId });
        controllerStream.close();
        clearTimeout(timeout);
      } catch (err) {
        controllerStream.error(err);
        clearTimeout(timeout);
      }
    },
  });

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
      'X-Accel-Buffering': 'no',
    },
  });
}
