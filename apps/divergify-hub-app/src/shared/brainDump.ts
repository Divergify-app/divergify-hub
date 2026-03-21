const INLINE_SPLIT_REGEX = /\s*(?:[;•●▪◦])\s*/;
const LEADING_MARKER_REGEX = /^\s*(?:[-*•●▪◦]+|\d+[.)]|[A-Za-z][.)]|\[\s?\])\s*/;
const ACTION_HINTS = [
  "call",
  "email",
  "send",
  "reply",
  "pay",
  "book",
  "schedule",
  "fix",
  "finish",
  "submit",
  "write",
  "clean",
  "buy",
  "pick up",
  "drop off",
  "renew",
  "cancel",
  "plan",
  "review",
  "draft"
];
const NOW_HINTS = ["today", "tonight", "asap", "urgent", "before", "due", "now", "this morning", "this afternoon"];
const LATER_HINTS = ["later", "someday", "eventually", "idea", "maybe", "wishlist", "research", "read", "watch", "sometime"];
const NOTE_HINTS = ["idea:", "note:", "remember:", "question:", "thought:"];

export type BrainDumpBuckets = {
  now: string[];
  later: string[];
  notes: string[];
};

export function normalizeBrainDumpEntry(value: string) {
  return value.replace(LEADING_MARKER_REGEX, "").replace(/\s+/g, " ").trim();
}

export function parseBrainDump(text: string) {
  return text
    .split(/\r?\n+/)
    .flatMap((line) => line.split(INLINE_SPLIT_REGEX))
    .map(normalizeBrainDumpEntry)
    .filter(Boolean);
}

function startsWithAction(text: string) {
  const lower = text.toLowerCase();
  return ACTION_HINTS.some((hint) => lower === hint || lower.startsWith(`${hint} `));
}

function includesHint(text: string, hints: string[]) {
  const lower = text.toLowerCase();
  return hints.some((hint) => lower.includes(hint));
}

function looksLikeTask(text: string) {
  if (startsWithAction(text)) return true;
  if (includesHint(text, NOW_HINTS)) return true;
  if (/[?]$/.test(text)) return false;
  return /\b(to|for|about)\b/.test(text.toLowerCase()) && text.split(" ").length <= 10;
}

export function sortBrainDumpLocally(text: string): BrainDumpBuckets {
  const buckets: BrainDumpBuckets = { now: [], later: [], notes: [] };

  for (const item of parseBrainDump(text)) {
    if (includesHint(item, LATER_HINTS)) {
      if (includesHint(item, NOTE_HINTS)) {
        buckets.notes.push(item);
        continue;
      }
      buckets.later.push(item);
      continue;
    }

    if (looksLikeTask(item)) {
      buckets.now.push(item);
      continue;
    }

    buckets.notes.push(item);
  }

  return buckets;
}
