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

type RequestOptions = {
  tinFoilHat: boolean;
};

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
  if (options.tinFoilHat) {
    return { ok: false, error: "Tin Foil Hat is enabled." };
  }
  return await postJson<SortResponse>("/api/ai/sort", { text });
}

export async function breakdownWithAi(
  task: string,
  options: RequestOptions
): Promise<AiSuccessResult<BreakdownResponse> | AiErrorResult> {
  if (options.tinFoilHat) {
    return { ok: false, error: "Tin Foil Hat is enabled." };
  }
  return await postJson<BreakdownResponse>("/api/ai/breakdown", { task });
}
