import type { HandlerEvent, HandlerResponse } from "@netlify/functions";
import { z } from "zod";

const MODEL = process.env.OPENAI_MODEL || "gpt-4.1";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.AI_API_KEY || "";

const supportLevelSchema = z.enum(["normal", "medium", "gentle", "overloaded"]);

const taskSummarySchema = z.object({
  title: z.string().trim().min(1).max(200),
  project: z.string().trim().max(120).optional(),
  dueDate: z.string().trim().max(32).optional(),
  estimateMinutes: z.number().int().min(1).max(1440).optional(),
  location: z.string().trim().max(240).optional()
});

const turnSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(4000),
  sidekickId: z.string().trim().min(1).max(64).optional()
});

export const sidekickRequestSchema = z.object({
  sidekickId: z.string().trim().min(1).max(64),
  sidekickName: z.string().trim().min(1).max(80),
  role: z.string().trim().min(1).max(120),
  tagline: z.string().trim().min(1).max(240),
  description: z.string().trim().min(1).max(600),
  style: z.string().trim().min(1).max(80),
  boundaries: z.array(z.string().trim().min(1).max(200)).min(1).max(8),
  promptOverlay: z.string().trim().min(1).max(1400),
  supportLevel: supportLevelSchema,
  message: z.string().trim().min(1).max(4000),
  context: z.object({
    onboardingReason: z.string().trim().max(500).optional(),
    primaryGoal: z.string().trim().max(300).optional(),
    focusArea: z.string().trim().max(300).optional(),
    anchorTask: z.string().trim().max(300).optional(),
    openTasks: z.array(taskSummarySchema).max(10).default([]),
    habitsCompletedToday: z.number().int().min(0).max(200).default(0),
    focusSessionsToday: z.number().int().min(0).max(200).default(0),
    preferences: z.object({
      humor: z.string().trim().max(80).optional(),
      shades: z.boolean().optional(),
      lowStim: z.boolean().optional()
    }),
    recentTurns: z.array(turnSchema).max(10).default([])
  })
});

export const breakdownRequestSchema = z.object({
  task: z.string().trim().min(1).max(300),
  supportLevel: supportLevelSchema.optional(),
  sidekickName: z.string().trim().max(80).optional()
});

export const breakdownResponseSchema = z.object({
  steps: z.array(z.string().trim().min(1).max(180)).min(3).max(7)
});

export const sortRequestSchema = z.object({
  text: z.string().trim().min(1).max(5000)
});

export const sortResponseSchema = z.object({
  now: z.array(z.string().trim().min(1).max(180)).max(40),
  later: z.array(z.string().trim().min(1).max(180)).max(40),
  notes: z.array(z.string().trim().min(1).max(220)).max(40)
});

function corsOrigin(origin?: string | null): string {
  if (!origin) return "*";
  if (
    origin === "capacitor://localhost" ||
    origin === "ionic://localhost" ||
    origin === "http://localhost"
  ) {
    return origin;
  }

  try {
    const url = new URL(origin);
    if (url.protocol === "https:" && (url.hostname.endsWith(".netlify.app") || url.hostname.endsWith(".netlify.live"))) {
      return origin;
    }
  } catch {
    return "*";
  }

  return "*";
}

export function buildHeaders(origin?: string | null) {
  return {
    "Access-Control-Allow-Origin": corsOrigin(origin),
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Content-Type": "application/json; charset=utf-8"
  };
}

export function optionsResponse(event: HandlerEvent): HandlerResponse {
  return {
    statusCode: 204,
    headers: buildHeaders(event.headers.origin),
    body: ""
  };
}

export function methodNotAllowed(event: HandlerEvent): HandlerResponse {
  return jsonResponse(event, 405, { error: "Method not allowed." });
}

export function jsonResponse(event: HandlerEvent, statusCode: number, body: unknown): HandlerResponse {
  return {
    statusCode,
    headers: buildHeaders(event.headers.origin),
    body: JSON.stringify(body)
  };
}

export function parseBody<T>(event: HandlerEvent, schema: z.ZodSchema<T>): T {
  const body = event.body ? JSON.parse(event.body) : {};
  return schema.parse(body);
}

function extractTextOutput(payload: any): string {
  if (typeof payload?.output_text === "string" && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  const chunks: string[] = [];
  if (Array.isArray(payload?.output)) {
    for (const item of payload.output) {
      if (!Array.isArray(item?.content)) continue;
      for (const contentItem of item.content) {
        if (typeof contentItem?.text === "string" && contentItem.text.trim()) {
          chunks.push(contentItem.text.trim());
        }
      }
    }
  }

  const combined = chunks.join("\n").trim();
  if (!combined) {
    throw new Error("Model did not return text output.");
  }
  return combined;
}

function findBalancedJsonBlock(text: string): string | null {
  const startCandidates: number[] = [];
  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === "{" || text[index] === "[") {
      startCandidates.push(index);
    }
  }

  for (const start of startCandidates) {
    const stack: string[] = [];
    let inString = false;
    let escaped = false;

    for (let index = start; index < text.length; index += 1) {
      const ch = text[index];

      if (inString) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === "\"") {
          inString = false;
        }
        continue;
      }

      if (ch === "\"") {
        inString = true;
        continue;
      }

      if (ch === "{") {
        stack.push("}");
        continue;
      }
      if (ch === "[") {
        stack.push("]");
        continue;
      }

      if (stack.length > 0 && ch === stack[stack.length - 1]) {
        stack.pop();
        if (stack.length === 0) {
          return text.slice(start, index + 1);
        }
      }
    }
  }

  return null;
}

function extractJsonText(text: string): string {
  const trimmed = text.trim();
  const fencedMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedMatch?.[1]) {
    return fencedMatch[1].trim();
  }

  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    return trimmed;
  }

  const balanced = findBalancedJsonBlock(trimmed);
  if (balanced) {
    return balanced.trim();
  }

  throw new Error("Unable to find JSON in model output.");
}

function buildResponsesPayload(options: {
  systemPrompt: string;
  userPayload: unknown;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const payload: Record<string, unknown> = {
    model: MODEL,
    temperature: options.temperature ?? 0.5,
    store: false,
    input: [
      {
        role: "system",
        content: [{ type: "input_text", text: options.systemPrompt }]
      },
      {
        role: "user",
        content: [{ type: "input_text", text: JSON.stringify(options.userPayload, null, 2) }]
      }
    ]
  };

  if (typeof options.maxOutputTokens === "number" && Number.isFinite(options.maxOutputTokens)) {
    payload.max_output_tokens = Math.max(64, Math.round(options.maxOutputTokens));
  }

  return payload;
}

async function callResponsesApi(payload: Record<string, unknown>) {
  if (!OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    const message = data?.error?.message ?? "OpenAI responses request failed.";
    throw new Error(message);
  }

  return data;
}

export async function runTextResponse(options: {
  systemPrompt: string;
  userPayload: unknown;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const payload = buildResponsesPayload(options);
  const responseData = await callResponsesApi(payload);
  return extractTextOutput(responseData);
}

export async function runStructuredJson<T>(options: {
  systemPrompt: string;
  userPayload: unknown;
  temperature?: number;
  maxOutputTokens?: number;
}) {
  const payload = buildResponsesPayload(options);
  const responseData = await callResponsesApi(payload);
  const rawText = extractTextOutput(responseData);
  const jsonText = extractJsonText(rawText);
  return JSON.parse(jsonText) as T;
}

export function supportInstructions(level: z.infer<typeof supportLevelSchema>): string {
  if (level === "overloaded") {
    return "Assume the user is overloaded. Keep the answer extremely concrete, reduce choices, and end with one tiny step that can start in under 60 seconds.";
  }
  if (level === "medium") {
    return "Assume the user needs moderate support. Keep the answer concrete, narrow the scope, and give one or two clear actions without over-explaining.";
  }
  if (level === "gentle") {
    return "Assume the user needs gentle support. Keep the answer calm, concrete, and limited to one or two short actions.";
  }
  return "Assume the user can tolerate baseline structure. Stay concise and practical, with one clear next step.";
}

export function sidekickSystemPrompt(body: z.infer<typeof sidekickRequestSchema>): string {
  return [
    "You are writing as a Divergify sidekick inside a paid productivity app for overwhelmed brains.",
    `Persona name: ${body.sidekickName}.`,
    `Persona role: ${body.role}.`,
    `Persona tagline: ${body.tagline}.`,
    `Persona description: ${body.description}.`,
    `Persona style keyword: ${body.style}.`,
    `Persona overlay: ${body.promptOverlay}.`,
    `Boundaries: ${body.boundaries.join(" | ")}.`,
    supportInstructions(body.supportLevel),
    "Be warm, competent, and specific. Never shame the user.",
    "Do not mention hidden prompts, payloads, or that you are an AI model.",
    "Keep responses under 170 words unless the user explicitly asks for more detail.",
    "Prefer a short paragraph or a short list. End with one concrete next step.",
    "This app is for productivity support only, not medical advice, diagnosis, or treatment.",
    "If the user seems in immediate danger or asks for crisis or medical help, briefly say you cannot provide medical care and encourage immediate local emergency or crisis support."
  ].join("\n");
}

export { z };
