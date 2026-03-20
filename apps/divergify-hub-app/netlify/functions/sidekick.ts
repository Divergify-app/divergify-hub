import type { Handler } from "@netlify/functions";
import {
  jsonResponse,
  methodNotAllowed,
  optionsResponse,
  parseBody,
  runTextResponse,
  sidekickRequestSchema,
  sidekickSystemPrompt,
  z
} from "./_shared/ai";

export const handler: Handler = async (event) => {
  if (event.httpMethod === "OPTIONS") {
    return optionsResponse(event);
  }

  if (event.httpMethod !== "POST") {
    return methodNotAllowed(event);
  }

  try {
    const body = parseBody(event, sidekickRequestSchema);
    const reply = await runTextResponse({
      systemPrompt: sidekickSystemPrompt(body),
      userPayload: {
        userMessage: body.message,
        context: body.context
      },
      temperature: 0.8,
      maxOutputTokens: 280
    });

    return jsonResponse(event, 200, { reply: reply.trim() });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(event, 400, { error: error.flatten() });
    }

    const message = error instanceof Error ? error.message : "Sidekick request failed.";
    return jsonResponse(event, 500, { error: message });
  }
};
