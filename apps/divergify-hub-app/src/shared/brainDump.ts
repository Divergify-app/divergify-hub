const INLINE_SPLIT_REGEX = /\s*(?:[;•●▪◦])\s*/;
const LEADING_MARKER_REGEX = /^\s*(?:[-*•●▪◦]+|\d+[.)]|[A-Za-z][.)]|\[\s?\])\s*/;

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
