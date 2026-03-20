import type { Handler } from "@netlify/functions";
import {
  jsonResponse,
  methodNotAllowed,
  optionsResponse,
  parseBody,
  runStructuredJson,
  sortRequestSchema,
  sortResponseSchema,
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
    const body = parseBody(event, sortRequestSchema);
    const result = await runStructuredJson({
      systemPrompt: [
        "You sort a messy brain dump into three buckets for a productivity app.",
        "Return JSON only with keys: tasks, shopping, notes.",
        "Move actionable task-sized items into tasks.",
        "Move purchasable items into shopping.",
        "Keep reminders, ideas, or context notes in notes.",
        "Do not invent content and do not duplicate items across buckets."
      ].join("\n"),
      userPayload: {
        text: body.text
      },
      temperature: 0.2,
      maxOutputTokens: 260
    });

    return jsonResponse(event, 200, sortResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(event, 400, { error: error.flatten() });
    }

    const message = error instanceof Error ? error.message : "Sort request failed.";
    return jsonResponse(event, 500, { error: message });
  }
};
