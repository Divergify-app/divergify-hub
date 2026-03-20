type AiErrorResult = {
  ok: false;
  error: string;
};

type AiSuccessResult<T> = {
  ok: true;
  data: T;
};

type SortResponse = {
  tasks: string[];
  shopping: string[];
  notes: string[];
};

type BreakdownResponse = {
  steps: string[];
};

type SidekickResponse = {
  reply: string;
};

export type SidekickRequest = {
  sidekickId: string;
  sidekickName: string;
  role: string;
  tagline: string;
  description: string;
  style: string;
  boundaries: string[];
  supportLevel: "normal" | "medium" | "gentle" | "overloaded";
  message: string;
  context: {
    onboardingReason?: string;
    primaryGoal?: string;
    focusArea?: string;
    anchorTask?: string;
    openTasks: Array<{
      title: string;
      project?: string;
      dueDate?: string;
      estimateMinutes?: number;
      location?: string;
    }>;
    habitsCompletedToday: number;
    focusSessionsToday: number;
    preferences: {
      humor?: string;
      shades?: boolean;
      lowStim?: boolean;
    };
    recentTurns: Array<{
      role: "user" | "assistant";
      content: string;
      sidekickId?: string;
    }>;
  };
};

type RequestOptions = {
  tinFoilHat: boolean;
};

function cloudAssistBlocked(options: RequestOptions): string | null {
  if (options.tinFoilHat) return "Tinfoil Hat is enabled.";
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "Device is offline.";
  }
  return null;
}

function normalizeBaseUrl(input: string) {
  return input.trim().replace(/\/+$/, "");
}

function resolveApiBaseUrl() {
  const envBase = typeof import.meta !== "undefined" ? import.meta.env?.VITE_API_BASE_URL : "";
  if (typeof envBase === "string" && envBase.trim()) {
    return normalizeBaseUrl(envBase);
  }

  if (typeof window === "undefined") {
    return "";
  }

  const { hostname, port, origin } = window.location;
  const isDevPreview = port === "4173" || port === "5173" || port === "8080";
  if (window.location.protocol === "http:" && isDevPreview) {
    return `http://${hostname}:3001`;
  }

  if (window.location.protocol === "http:" && hostname === "localhost" && !port) {
    return "http://10.0.2.2:3001";
  }

  return origin;
}

function apiUrl(path: string) {
  const base = resolveApiBaseUrl();
  return `${base}${path}`;
}

async function postJson<T>(url: string, payload: unknown): Promise<AiSuccessResult<T> | AiErrorResult> {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      return { ok: false, error: `Request failed (${response.status}).` };
    }

    const data = (await response.json()) as T;
    return { ok: true, data };
  } catch {
    return { ok: false, error: "Network request failed." };
  }
}

export async function sortWithAi(
  text: string,
  options: RequestOptions
): Promise<AiSuccessResult<SortResponse> | AiErrorResult> {
  const blockedReason = cloudAssistBlocked(options);
  if (blockedReason) {
    return { ok: false, error: blockedReason };
  }
  return await postJson<SortResponse>(apiUrl("/api/ai/sort"), { text });
}

export async function breakdownWithAi(
  task: string,
  options: RequestOptions
): Promise<AiSuccessResult<BreakdownResponse> | AiErrorResult> {
  const blockedReason = cloudAssistBlocked(options);
  if (blockedReason) {
    return { ok: false, error: blockedReason };
  }
  return await postJson<BreakdownResponse>(apiUrl("/api/ai/breakdown"), { task });
}

export async function sidekickReplyWithAi(
  payload: SidekickRequest,
  options: RequestOptions
): Promise<AiSuccessResult<SidekickResponse> | AiErrorResult> {
  const blockedReason = cloudAssistBlocked(options);
  if (blockedReason) {
    return { ok: false, error: blockedReason };
  }
  return await postJson<SidekickResponse>(apiUrl("/api/ai/sidekick"), payload);
}
