import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PHI, colors, motion, radii, spacing, typography } from "../../design/tokens";

const STORAGE_KEY = "divergify.brainDump.v1";

// Golden-ratio split: the dump takes the major section, the controls the minor.
const GOLDEN_MAJOR = 1 / PHI; // ~0.618
const GOLDEN_MINOR = 1 - GOLDEN_MAJOR; // ~0.382

type SortMode = "messy" | "az" | "za";

type StoredDump = {
  text: string;
  tag: string;
  savedAt: string | null;
};

function loadDump(): StoredDump {
  if (typeof window === "undefined") return { text: "", tag: "", savedAt: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { text: "", tag: "", savedAt: null };
    const parsed = JSON.parse(raw) as Partial<StoredDump>;
    return {
      text: typeof parsed.text === "string" ? parsed.text : "",
      tag: typeof parsed.tag === "string" ? parsed.tag : "",
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : null,
    };
  } catch {
    return { text: "", tag: "", savedAt: null };
  }
}

function formatSavedAt(value: string | null): string {
  if (!value) return "Nothing saved yet — and that is completely fine.";
  const when = new Date(value);
  if (Number.isNaN(when.getTime())) return "Saved.";
  return `Saved ${when.toLocaleString()}. It will be here when you come back.`;
}

export function BrainDumpScreen() {
  const initial = useRef<StoredDump>(loadDump());
  const [text, setText] = useState(initial.current.text);
  const [tag, setTag] = useState(initial.current.tag);
  const [sort, setSort] = useState<SortMode>("messy");
  const [savedAt, setSavedAt] = useState<string | null>(initial.current.savedAt);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (!justSaved) return;
    const timer = window.setTimeout(() => setJustSaved(false), motion.duration.slow * 6);
    return () => window.clearTimeout(timer);
  }, [justSaved]);

  const handleSave = () => {
    const next: StoredDump = { text, tag: tag.trim(), savedAt: new Date().toISOString() };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setSavedAt(next.savedAt);
      setJustSaved(true);
    } catch {
      // If storage is unavailable the thoughts still live in the text area.
    }
  };

  // Optional, reversible: re-orders lines only if the brain asks for it.
  const handleSort = (mode: SortMode) => {
    setSort(mode);
    if (mode === "messy") return;
    setText((current) => {
      const lines = current.split("\n").filter((line) => line.trim().length > 0);
      lines.sort((a, b) =>
        mode === "az"
          ? a.localeCompare(b, undefined, { sensitivity: "base" })
          : b.localeCompare(a, undefined, { sensitivity: "base" })
      );
      return lines.join("\n");
    });
  };

  const screen: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    minHeight: "82vh",
    padding: spacing.xl,
    gap: spacing.lg,
    color: colors.text.primary,
    fontFamily: typography.family.sans,
  };

  const dumpRegion: CSSProperties = {
    flexGrow: GOLDEN_MAJOR,
    flexBasis: 0,
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    minHeight: 0,
  };

  const intro: CSSProperties = {
    fontSize: typography.size.sm,
    lineHeight: typography.lineHeight.normal,
    color: colors.text.secondary,
    margin: 0,
  };

  const textArea: CSSProperties = {
    flex: 1,
    width: "100%",
    resize: "none",
    boxSizing: "border-box",
    padding: spacing.lg,
    borderRadius: radii.lg,
    border: `1px solid ${colors.border.base}`,
    background: colors.bg.raised,
    color: colors.text.primary,
    fontFamily: typography.family.sans,
    fontSize: typography.size.md,
    lineHeight: typography.lineHeight.loose,
    outline: "none",
  };

  const controlsRegion: CSSProperties = {
    flexGrow: GOLDEN_MINOR,
    flexBasis: 0,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: spacing.md,
  };

  const optionRow: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    gap: spacing.md,
    alignItems: "flex-end",
  };

  const field: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xxs,
    minWidth: 160,
  };

  const label: CSSProperties = {
    fontSize: typography.size.xs,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: colors.text.muted,
  };

  const inputBase: CSSProperties = {
    padding: `${spacing.sm}px ${spacing.md}px`,
    borderRadius: radii.md,
    border: `1px solid ${colors.border.base}`,
    background: colors.bg.overlay,
    color: colors.text.primary,
    fontFamily: typography.family.sans,
    fontSize: typography.size.sm,
    outline: "none",
  };

  const saveRow: CSSProperties = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.md,
  };

  const saveButton: CSSProperties = {
    padding: `${spacing.md}px ${spacing.xl}px`,
    borderRadius: radii.pill,
    border: "none",
    background: colors.accent.base,
    color: colors.bg.base,
    fontFamily: typography.family.sans,
    fontSize: typography.size.md,
    fontWeight: typography.weight.semibold,
    cursor: "pointer",
    transition: `background-color ${motion.duration.base}ms ${motion.easing.standard}`,
  };

  const status: CSSProperties = {
    fontSize: typography.size.sm,
    color: justSaved ? colors.status.success : colors.text.muted,
    margin: 0,
  };

  return (
    <section style={screen}>
      <div style={dumpRegion}>
        <p style={intro}>
          Everything in your head, here. No order, no spelling, no judgement — just get it out. You can
          shape it later, or never. This stays on your device.
        </p>
        <textarea
          style={textArea}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Let it spill. Lists, half-thoughts, the thing you keep forgetting, the worry, the idea at 2am..."
          aria-label="Brain dump"
          spellCheck={false}
        />
      </div>

      <div style={controlsRegion}>
        <div style={optionRow}>
          <div style={field}>
            <label style={label} htmlFor="brain-dump-tag">
              Tag (optional)
            </label>
            <input
              id="brain-dump-tag"
              style={inputBase}
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              placeholder="e.g. work, brain noise, someday"
            />
          </div>

          <div style={field}>
            <label style={label} htmlFor="brain-dump-sort">
              Sort (only if you want)
            </label>
            <select
              id="brain-dump-sort"
              style={inputBase}
              value={sort}
              onChange={(event) => handleSort(event.target.value as SortMode)}
            >
              <option value="messy">Leave it messy</option>
              <option value="az">Lines A → Z</option>
              <option value="za">Lines Z → A</option>
            </select>
          </div>
        </div>

        <div style={saveRow}>
          <button
            type="button"
            style={saveButton}
            onClick={handleSave}
            onMouseEnter={(event) => {
              event.currentTarget.style.background = colors.accent.strong;
            }}
            onMouseLeave={(event) => {
              event.currentTarget.style.background = colors.accent.base;
            }}
          >
            Save it
          </button>
          <p style={status} aria-live="polite">
            {justSaved ? "Got it. Nice work getting that out of your head." : formatSavedAt(savedAt)}
          </p>
        </div>
      </div>
    </section>
  );
}
