import { aiConfig, personaProfiles } from '../config/ai';

/**
 * Expected request body for /ai/voice:
 * { persona, convoId, transcript, device, clientSettings?: { mute?: boolean, speed?: number } }
 *
 * Streaming frames (SSE):
 * { text, speak, traceId } ... deltas
 * Final frame: { done: true, text, speak, ssml: null, traceId }
 * Error frame: { error: string, code?: string, traceId?: string }
 */

const defaultHandlers = {
  onToken: () => {},
  onDone: () => {},
  onError: () => {},
};

const consumeFrame = (frame, state, handlers) => {
  if (!frame) return false;
  if (frame.traceId) state.traceId = frame.traceId;
  if (typeof frame.speak === 'boolean') state.speak = frame.speak;
  if ('ssml' in frame) state.ssml = frame.ssml;

  if (frame.error || frame.code) {
    handlers.onError(frame);
    return true;
  }

  if (frame.done) {
    if (typeof frame.text === 'string') state.text = frame.text;
    handlers.onDone({
      text: state.text,
      speak: state.speak,
      ssml: state.ssml ?? null,
      traceId: state.traceId ?? frame.traceId,
      done: true,
    });
    return true;
  }

  if (frame.text) {
    state.text += frame.text;
    handlers.onToken({
      text: state.text,
      delta: frame.text,
      speak: state.speak,
      ssml: state.ssml ?? null,
      traceId: state.traceId,
    });
  }

  return false;
};

const decodeChunk = (value, decoder) => {
  if (decoder) return decoder.decode(value, { stream: true });
  return Array.from(value || [])
    .map((byte) => String.fromCharCode(byte))
    .join('');
};

const streamFromResponse = async (response, handlers) => {
  const reader = response?.body?.getReader?.();
  if (!reader) {
    const fallback = await response.text();
    const parsed = (() => {
      try {
        return JSON.parse(fallback);
      } catch (_e) {
        return { text: fallback };
      }
    })();
    const summary = {
      text: parsed.text || '',
      speak: parsed.speak ?? true,
      ssml: parsed.ssml ?? null,
      traceId: parsed.traceId,
    };
    handlers.onDone(summary);
    return summary;
  }

  const decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8') : null;
  let buffer = '';
  const state = { text: '', speak: true, ssml: null, traceId: undefined };

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decodeChunk(value, decoder);
    const events = buffer.split('\n\n');
    buffer = events.pop() ?? '';

    for (const evt of events) {
      const trimmed = evt.trim();
      if (!trimmed.startsWith('data:')) continue;
      const payload = trimmed.replace(/^data:\s*/, '');
      if (payload === '[DONE]') {
        consumeFrame({ done: true }, state, handlers);
        return state;
      }
      try {
        const frame = JSON.parse(payload);
        const isDone = consumeFrame(frame, state, handlers);
        if (isDone) return state;
      } catch (_e) {
        // ignore malformed frames, continue streaming
      }
    }
  }

  handlers.onDone({
    text: state.text,
    speak: state.speak,
    ssml: state.ssml ?? null,
    traceId: state.traceId,
    done: true,
  });
  return state;
};

export async function streamVoiceResponse({
  transcript,
  persona = 'takota',
  convoId,
  clientSettings,
  onToken = defaultHandlers.onToken,
  onDone = defaultHandlers.onDone,
  onError = defaultHandlers.onError,
}) {
  if (!transcript?.trim()) {
    throw new Error('Transcript is required to contact Takota.');
  }
  if (!aiConfig.baseUrl) {
    throw new Error('AI base URL missing. Set EXPO_PUBLIC_AI_BASE_URL before running.');
  }

  const profile = personaProfiles[persona] ?? personaProfiles.takota;
  const url = `${aiConfig.baseUrl}/ai/voice`;
  const payload = {
    persona: profile.persona,
    convoId,
    transcript: transcript.trim(),
    device: aiConfig.device,
    clientSettings,
  };

  let response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch (_networkError) {
    const err = new Error('Unable to reach the AI service.');
    onError?.(err);
    throw err;
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    const err = new Error(
      `Voice endpoint returned ${response.status}. ${errorBody || 'No error body provided.'}`
    );
    onError(err);
    throw err;
  }

  const state = await streamFromResponse(response, {
    onToken,
    onDone,
    onError,
  });

  return state;
}

export const takotaProfile = personaProfiles.takota;
