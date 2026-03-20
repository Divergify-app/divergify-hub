import type { Handler } from "@netlify/functions";
import {
  breakdownRequestSchema,
  breakdownResponseSchema,
  jsonResponse,
  methodNotAllowed,
  optionsResponse,
  parseBody,
  runStructuredJson,
  supportInstructions,
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
    const body = parseBody(event, breakdownRequestSchema);
    const result = await runStructuredJson({
      systemPrompt: [
        "You break one task into a short sequence of realistic micro-steps for a productivity app.",
        "Return JSON only with a top-level \"steps\" array.",
        "Each step must be concrete, short, and action-first.",
        "No intro text, no markdown, no extra keys.",
        supportInstructions(body.supportLevel ?? "gentle"),
        body.sidekickName ? `Voice should loosely match ${body.sidekickName}.` : ""
      ]
        .filter(Boolean)
        .join("\n"),
      userPayload: {
        task: body.task
      },
      temperature: 0.4,
      maxOutputTokens: 220
    });

    return jsonResponse(event, 200, breakdownResponseSchema.parse(result));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return jsonResponse(event, 400, { error: error.flatten() });
    }

    const message = error instanceof Error ? error.message : "Breakdown request failed.";
    return jsonResponse(event, 500, { error: message });
  }
};
