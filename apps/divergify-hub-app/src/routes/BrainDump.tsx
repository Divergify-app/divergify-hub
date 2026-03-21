import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { sortWithAi } from "../shared/aiClient";
import { sortBrainDumpLocally, type BrainDumpBuckets } from "../shared/brainDump";
import { todayISO, uid } from "../shared/utils";
import { useApp } from "../state/useApp";
import type { TaskPriority } from "../state/types";

type BrainDumpBucket = keyof BrainDumpBuckets;

type BrainDumpDraft = {
  id: string;
  title: string;
  bucket: BrainDumpBucket;
  selected: boolean;
};

type SpeechRecognitionEventLike = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionCtor = new () => SpeechRecognitionLike;

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 1, label: "P1" },
  { value: 2, label: "P2" },
  { value: 3, label: "P3" },
  { value: 4, label: "P4" }
];

const SAMPLE_DUMP = [
  "email landlord about the leak before noon",
  "groceries: oat milk, strawberries, cereal",
  "send the invoice before I forget",
  "idea: give Takota a better comeback button",
  "book the dentist and haircut"
].join("\n");

const BUCKET_ORDER: BrainDumpBucket[] = ["now", "later", "notes"];

const BUCKET_COPY: Record<BrainDumpBucket, { label: string; subtitle: string }> = {
  now: {
    label: "Do now",
    subtitle: "These land on Today by default."
  },
  later: {
    label: "Park for later",
    subtitle: "These get a reminder date when you import them."
  },
  notes: {
    label: "Notes and scraps",
    subtitle: "Context stays parked until you turn it into work."
  }
};

function addDays(baseIso: string, days: number): string {
  const date = new Date(`${baseIso}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return baseIso;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const speechWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  };
  return speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition ?? null;
}

function draftsFromBuckets(buckets: BrainDumpBuckets): BrainDumpDraft[] {
  return BUCKET_ORDER.flatMap((bucket) =>
    buckets[bucket].map((title) => ({
      id: uid(),
      title,
      bucket,
      selected: bucket !== "notes"
    }))
  );
}

export function BrainDump() {
  const { data, actions } = useApp();
  const today = todayISO();
  const [sourceText, setSourceText] = useState("");
  const [drafts, setDrafts] = useState<BrainDumpDraft[]>([]);
  const [project, setProject] = useState("Inbox");
  const [laterDate, setLaterDate] = useState(addDays(today, 3));
  const [priority, setPriority] = useState<TaskPriority>(3);
  const [status, setStatus] = useState<string | null>(null);
  const [isSorting, setIsSorting] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const speechCtor = useMemo(() => getSpeechRecognitionCtor(), []);

  const projectOptions = useMemo(() => {
    const values = new Set<string>(["Inbox"]);
    for (const task of data.tasks) values.add(task.project || "Inbox");
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [data.tasks]);

  const openTasks = useMemo(() => data.tasks.filter((task) => !task.done), [data.tasks]);
  const selectedCount = useMemo(
    () => drafts.filter((draft) => draft.selected && draft.title.trim() && draft.bucket !== "notes").length,
    [drafts]
  );
  const bucketCounts = useMemo(
    () => ({
      now: drafts.filter((draft) => draft.bucket === "now").length,
      later: drafts.filter((draft) => draft.bucket === "later").length,
      notes: drafts.filter((draft) => draft.bucket === "notes").length
    }),
    [drafts]
  );

  useEffect(() => {
    if (!speechCtor || !isListening) return undefined;

    const recognition = new speechCtor();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const latest = event.results[event.results.length - 1];
      const transcript = latest?.[0]?.transcript?.trim() || "";

      if (!transcript) return;

      setSourceText((current) => {
        const spacer = current.trim() ? "\n" : "";
        return `${current}${spacer}${transcript}`.trim();
      });
    };

    recognition.onerror = (event) => {
      setStatus(event.error ? `Voice capture stopped: ${event.error}.` : "Voice capture stopped.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [isListening, speechCtor]);

  const untangle = async () => {
    const text = sourceText.trim();
    if (!text) return;

    setIsSorting(true);
    try {
      if (!data.preferences.tinFoil) {
        const result = await sortWithAi(text, { tinFoilHat: data.preferences.tinFoil });
        if (result.ok) {
          const buckets: BrainDumpBuckets = {
            now: result.data.now ?? [],
            later: result.data.later ?? [],
            notes: result.data.notes ?? []
          };
          const nextDrafts = draftsFromBuckets(buckets);
          setDrafts(nextDrafts);
          setStatus(`Assist sorted ${nextDrafts.length} item${nextDrafts.length === 1 ? "" : "s"} into now, later, and notes.`);
          return;
        }

        const fallback = sortBrainDumpLocally(text);
        const nextDrafts = draftsFromBuckets(fallback);
        setDrafts(nextDrafts);
        setStatus(`Assist was unavailable, so Divergify sorted locally. ${result.error}`);
        return;
      }

      const fallback = sortBrainDumpLocally(text);
      const nextDrafts = draftsFromBuckets(fallback);
      setDrafts(nextDrafts);
      setStatus(`Tinfoil Hat kept this local. Sorted ${nextDrafts.length} item${nextDrafts.length === 1 ? "" : "s"} on-device.`);
    } finally {
      setIsSorting(false);
    }
  };

  const importSelected = () => {
    const selectedDrafts = drafts.filter((draft) => draft.selected && draft.title.trim() && draft.bucket !== "notes");
    if (!selectedDrafts.length) return;

    for (const draft of selectedDrafts) {
      actions.addTask({
        title: draft.title.trim(),
        project: project.trim() || "Inbox",
        dueDate: draft.bucket === "now" ? today : laterDate || addDays(today, 3),
        priority,
        recurrence: "none"
      });
    }

    const importedIds = new Set(selectedDrafts.map((draft) => draft.id));
    setDrafts((current) => current.filter((draft) => !importedIds.has(draft.id)));
    setStatus(`Added ${selectedDrafts.length} planner item${selectedDrafts.length === 1 ? "" : "s"}.`);
  };

  const clearAll = () => {
    setSourceText("");
    setDrafts([]);
    setStatus(null);
    setIsListening(false);
  };

  const moveDraft = (draftId: string, bucket: BrainDumpBucket) => {
    setDrafts((current) =>
      current.map((draft) =>
        draft.id === draftId
          ? { ...draft, bucket, selected: bucket === "notes" ? false : draft.selected }
          : draft
      )
    );
  };

  const setAllSelected = (selected: boolean) => {
    setDrafts((current) =>
      current.map((draft) => (draft.bucket === "notes" ? draft : { ...draft, selected }))
    );
  };

  return (
    <div className="workspace-shell">
      <section className="workspace-hero panel stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="stack" style={{ gap: 8, minWidth: 260, flex: 1 }}>
            <div className="badge">Brain Dump</div>
            <h2 className="workspace-title">Say it messy. We sort it after.</h2>
            <p className="p">
              Talk or type the raw chaos first. Divergify sorts it into now, later, and parked notes so you do not
              have to translate your own brain before getting help.
            </p>
          </div>
        </div>

        <div className="metric-strip">
          <div className="metric-card">
            <span className="metric-label">Open tasks</span>
            <strong>{openTasks.length}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Do now</span>
            <strong>{bucketCounts.now}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Later</span>
            <strong>{bucketCounts.later}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Notes</span>
            <strong>{bucketCounts.notes}</strong>
          </div>
        </div>
      </section>

      <div className="brain-dump-grid">
        <section className="workspace-card stack">
          <div className="stack" style={{ gap: 6 }}>
            <div className="badge">Capture</div>
            <h3 className="h2">Dump it here.</h3>
            <p className="p">No cleanup first. Speak or type the ugly version and let the app do the sorting.</p>
          </div>

          <textarea
            id="brain-dump-input"
            className="textarea brain-dump-textarea"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder="Example: call dentist, email client back, groceries, why am I avoiding the invoice, idea for Takota, refill meds..."
          />

          <div className="brain-dump-actions">
            <button className="btn primary" onClick={() => void untangle()} disabled={!sourceText.trim() || isSorting}>
              {isSorting ? "Sorting..." : "Sort it for me"}
            </button>
            {speechCtor ? (
              <button
                className={`btn ${isListening ? "primary" : ""}`}
                onClick={() => setIsListening((current) => !current)}
                aria-pressed={isListening}
              >
                {isListening ? "Stop talking" : "Start talking"}
              </button>
            ) : null}
            <button
              className="btn"
              onClick={() => {
                setSourceText(SAMPLE_DUMP);
                setStatus("Sample loaded.");
              }}
            >
              Load sample
            </button>
            <button className="btn" onClick={clearAll} disabled={!sourceText.trim() && drafts.length === 0}>
              Clear
            </button>
          </div>

          <div className="notice">
            {data.preferences.tinFoil
              ? "Tinfoil Hat is on, so sorting stays local on this device."
              : "Cloud assist sorts when available. If it is blocked or offline, Divergify falls back locally."}
          </div>

          {status ? <div className="notice">{status}</div> : null}
        </section>

        <div className="stack">
          <section className="workspace-card stack">
            <div className="stack" style={{ gap: 6 }}>
              <div className="badge">Import defaults</div>
              <h3 className="h2">When you keep it, where should it land?</h3>
            </div>

            <div className="quick-add-controls">
              <div className="field">
                <label className="label" htmlFor="brain-dump-project">Project</label>
                <input
                  id="brain-dump-project"
                  className="input"
                  value={project}
                  list="brain-dump-projects"
                  onChange={(event) => setProject(event.target.value)}
                />
                <datalist id="brain-dump-projects">
                  {projectOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>

              <div className="field">
                <label className="label" htmlFor="brain-dump-later-date">Later reminder</label>
                <input
                  id="brain-dump-later-date"
                  className="input"
                  type="date"
                  value={laterDate}
                  onChange={(event) => setLaterDate(event.target.value)}
                />
              </div>

              <div className="field">
                <label className="label" htmlFor="brain-dump-priority">Priority</label>
                <select
                  id="brain-dump-priority"
                  className="select"
                  value={priority}
                  onChange={(event) => setPriority(Number(event.target.value) as TaskPriority)}
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="task-chip-row">
              <button className="btn" onClick={() => setLaterDate(addDays(today, 1))}>Tomorrow</button>
              <button className="btn" onClick={() => setLaterDate(addDays(today, 3))}>3 days</button>
              <button className="btn" onClick={() => setLaterDate(addDays(today, 7))}>Next week</button>
            </div>

            <div className="notice">
              Now items import onto Today. Later items use the reminder date above. Notes stay parked until you move them.
            </div>
          </section>

          <section className="workspace-card stack">
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="badge">Sorted board</div>
                <h3 className="h2">Here is the cleaner version.</h3>
              </div>
              <span className="badge">{selectedCount} ready</span>
            </div>

            {drafts.length ? (
              <>
                <div className="brain-dump-actions">
                  <button className="btn" onClick={() => setAllSelected(true)}>
                    Select all tasks
                  </button>
                  <button className="btn" onClick={() => setAllSelected(false)}>
                    Clear task selection
                  </button>
                  <button className="btn primary" onClick={importSelected} disabled={selectedCount === 0}>
                    Add selected to planner
                  </button>
                </div>

                <div className="brain-bucket-grid">
                  {BUCKET_ORDER.map((bucket) => {
                    const items = drafts.filter((draft) => draft.bucket === bucket);
                    const copy = BUCKET_COPY[bucket];

                    return (
                      <section key={bucket} className={`brain-bucket brain-bucket-${bucket}`}>
                        <div className="stack" style={{ gap: 4 }}>
                          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
                            <strong>{copy.label}</strong>
                            <span className="badge">{items.length}</span>
                          </div>
                          <div className="mini">{copy.subtitle}</div>
                        </div>

                        {items.length ? (
                          <div className="brain-sticky-list">
                            {items.map((draft) => (
                              <article key={draft.id} className={`brain-sticky ${draft.selected ? "selected" : ""}`}>
                                {draft.bucket !== "notes" ? (
                                  <input
                                    className="task-check"
                                    type="checkbox"
                                    checked={draft.selected}
                                    onChange={(event) => {
                                      const selected = event.target.checked;
                                      setDrafts((current) =>
                                        current.map((item) => (item.id === draft.id ? { ...item, selected } : item))
                                      );
                                    }}
                                  />
                                ) : (
                                  <span className="brain-sticky-pin" aria-hidden="true" />
                                )}

                                <textarea
                                  className="textarea brain-sticky-input"
                                  value={draft.title}
                                  onChange={(event) => {
                                    const title = event.target.value;
                                    setDrafts((current) =>
                                      current.map((item) => (item.id === draft.id ? { ...item, title } : item))
                                    );
                                  }}
                                />

                                <div className="brain-sticky-actions">
                                  {bucket !== "now" ? (
                                    <button className="btn ghost" onClick={() => moveDraft(draft.id, "now")}>
                                      Move to now
                                    </button>
                                  ) : null}
                                  {bucket !== "later" ? (
                                    <button className="btn ghost" onClick={() => moveDraft(draft.id, "later")}>
                                      Move to later
                                    </button>
                                  ) : null}
                                  {bucket !== "notes" ? (
                                    <button className="btn ghost" onClick={() => moveDraft(draft.id, "notes")}>
                                      Park note
                                    </button>
                                  ) : null}
                                  <button
                                    className="btn ghost"
                                    onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </article>
                            ))}
                          </div>
                        ) : (
                          <div className="task-empty">Nothing here yet.</div>
                        )}
                      </section>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="task-empty">
                Dump the messy version first. Divergify will sort it into do-now items, later reminders, and parked notes.
              </div>
            )}

            <div className="row" style={{ flexWrap: "wrap" }}>
              <Link to="/tasks" className="btn" style={{ textDecoration: "none" }}>
                Open planner
              </Link>
              <Link to="/focus" className="btn" style={{ textDecoration: "none" }}>
                Open focus
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
