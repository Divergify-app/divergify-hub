import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { parseBrainDump } from "../shared/brainDump";
import { todayISO, uid } from "../shared/utils";
import { useApp } from "../state/useApp";
import type { TaskPriority } from "../state/types";

type BrainDumpDraft = {
  id: string;
  title: string;
  selected: boolean;
};

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 1, label: "P1" },
  { value: 2, label: "P2" },
  { value: 3, label: "P3" },
  { value: 4, label: "P4" }
];

const SAMPLE_DUMP = [
  "email landlord about the leak",
  "groceries: oat milk, strawberries, cereal",
  "send the invoice before I forget",
  "book the dentist and haircut",
  "write tomorrow's first tiny step"
].join("\n");

function addDays(baseIso: string, days: number): string {
  const date = new Date(`${baseIso}T12:00:00`);
  if (Number.isNaN(date.valueOf())) return baseIso;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

export function BrainDump() {
  const { data, actions } = useApp();
  const today = todayISO();
  const [sourceText, setSourceText] = useState("");
  const [drafts, setDrafts] = useState<BrainDumpDraft[]>([]);
  const [project, setProject] = useState("Inbox");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>(3);
  const [status, setStatus] = useState<string | null>(null);

  const projectOptions = useMemo(() => {
    const values = new Set<string>(["Inbox"]);
    for (const task of data.tasks) values.add(task.project || "Inbox");
    return [...values].sort((a, b) => a.localeCompare(b));
  }, [data.tasks]);

  const openTasks = useMemo(() => data.tasks.filter((task) => !task.done), [data.tasks]);
  const inboxCount = useMemo(() => openTasks.filter((task) => !task.dueDate).length, [openTasks]);
  const selectedCount = useMemo(
    () => drafts.filter((draft) => draft.selected && draft.title.trim()).length,
    [drafts]
  );

  const untangle = () => {
    const parsed = parseBrainDump(sourceText);
    if (!parsed.length) {
      setDrafts([]);
      setStatus("No task-sized lines found yet. Use line breaks, bullets, or semicolons between items.");
      return;
    }

    setDrafts(parsed.map((title) => ({ id: uid(), title, selected: true })));
    setStatus(`Untangled ${parsed.length} ${parsed.length === 1 ? "task" : "tasks"}.`);
  };

  const importSelected = () => {
    const selectedDrafts = drafts.filter((draft) => draft.selected && draft.title.trim());
    if (!selectedDrafts.length) return;

    for (const draft of selectedDrafts) {
      actions.addTask({
        title: draft.title.trim(),
        project: project.trim() || "Inbox",
        dueDate: dueDate || undefined,
        priority,
        recurrence: "none"
      });
    }

    const importedIds = new Set(selectedDrafts.map((draft) => draft.id));
    setDrafts((current) => current.filter((draft) => !importedIds.has(draft.id)));
    setStatus(`Added ${selectedDrafts.length} ${selectedDrafts.length === 1 ? "task" : "tasks"} to the planner.`);
  };

  const clearAll = () => {
    setSourceText("");
    setDrafts([]);
    setStatus(null);
  };

  const setAllSelected = (selected: boolean) => {
    setDrafts((current) => current.map((draft) => ({ ...draft, selected })));
  };

  return (
    <div className="workspace-shell">
      <section className="workspace-hero panel stack">
        <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap", alignItems: "flex-start" }}>
          <div className="stack" style={{ gap: 8, minWidth: 260, flex: 1 }}>
            <div className="badge">Brain Dump</div>
            <h2 className="workspace-title">Drop the chaos. Keep the signal.</h2>
            <p className="p">
              Paste the messy list, untangle it into task drafts, edit the wording, then send the real items into the
              planner without losing momentum.
            </p>
          </div>

          <div className="hero-actions">
            <Link to="/tasks" className="btn" style={{ textDecoration: "none" }}>
              Open planner
            </Link>
            <Link to="/magic-tasks" className="btn" style={{ textDecoration: "none" }}>
              Magic Tasks
            </Link>
          </div>
        </div>

        <div className="metric-strip">
          <div className="metric-card">
            <span className="metric-label">Open tasks</span>
            <strong>{openTasks.length}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Inbox</span>
            <strong>{inboxCount}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Drafts</span>
            <strong>{drafts.length}</strong>
          </div>
          <div className="metric-card">
            <span className="metric-label">Ready to add</span>
            <strong>{selectedCount}</strong>
          </div>
        </div>
      </section>

      <div className="brain-dump-grid">
        <section className="workspace-card stack">
          <div className="stack" style={{ gap: 6 }}>
            <div className="badge">Composer</div>
            <h3 className="h2">Drop your chaos here.</h3>
            <p className="p">Line breaks work best. Bullets and semicolons split cleanly too.</p>
          </div>

          <textarea
            id="brain-dump-input"
            className="textarea brain-dump-textarea"
            value={sourceText}
            onChange={(event) => setSourceText(event.target.value)}
            placeholder="Write everything... groceries, that weird dream, work tasks, the meaning of life..."
          />

          <div className="brain-dump-actions">
            <button className="btn primary" onClick={untangle} disabled={!sourceText.trim()}>
              Untangle
            </button>
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
            Each selected draft becomes a real planner task. Edit the lines first if the dump is still too rambly.
          </div>

          {status ? <div className="notice">{status}</div> : null}
        </section>

        <div className="stack">
          <section className="workspace-card stack">
            <div className="stack" style={{ gap: 6 }}>
              <div className="badge">Defaults</div>
              <h3 className="h2">Where should these land?</h3>
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
                <label className="label" htmlFor="brain-dump-due">Due</label>
                <input
                  id="brain-dump-due"
                  className="input"
                  type="date"
                  value={dueDate}
                  onChange={(event) => setDueDate(event.target.value)}
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
              <button className="btn" onClick={() => setDueDate(today)}>Today</button>
              <button className="btn" onClick={() => setDueDate(addDays(today, 1))}>Tomorrow</button>
              <button className="btn" onClick={() => setDueDate("")}>Inbox</button>
            </div>
          </section>

          <section className="workspace-card stack">
            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <div className="stack" style={{ gap: 4 }}>
                <div className="badge">Untangled list</div>
                <h3 className="h2">Here is your cleaner list.</h3>
              </div>
              <span className="badge">{selectedCount} selected</span>
            </div>

            {drafts.length ? (
              <>
                <div className="brain-dump-actions">
                  <button className="btn" onClick={() => setAllSelected(true)}>
                    Select all
                  </button>
                  <button className="btn" onClick={() => setAllSelected(false)}>
                    Select none
                  </button>
                  <button className="btn primary" onClick={importSelected} disabled={selectedCount === 0}>
                    Add selected to planner
                  </button>
                </div>

                <div className="brain-dump-list">
                  {drafts.map((draft) => (
                    <div key={draft.id} className={`brain-dump-item ${draft.selected ? "selected" : ""}`}>
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
                      <input
                        className="input brain-dump-item-input"
                        value={draft.title}
                        onChange={(event) => {
                          const title = event.target.value;
                          setDrafts((current) =>
                            current.map((item) => (item.id === draft.id ? { ...item, title } : item))
                          );
                        }}
                      />
                      <button
                        className="btn ghost"
                        onClick={() => setDrafts((current) => current.filter((item) => item.id !== draft.id))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="task-empty">
                Paste the messy version first, hit Untangle, and the editable task drafts will land here.
              </div>
            )}

            <div className="row" style={{ flexWrap: "wrap" }}>
              <Link to="/tasks" className="btn" style={{ textDecoration: "none" }}>
                Open planner
              </Link>
              <Link to="/calendar" className="btn" style={{ textDecoration: "none" }}>
                Calendar board
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
