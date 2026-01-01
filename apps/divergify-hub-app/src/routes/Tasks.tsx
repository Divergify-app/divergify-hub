import { useMemo, useState } from "react";
import { useApp } from "../state/useApp";
import { todayISO } from "../shared/utils";

function parseTags(s: string) {
  return s.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 8);
}

export function Tasks() {
  const { data, actions } = useApp();

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");

  const openTasks = useMemo(() => data.tasks.filter((t) => !t.done), [data.tasks]);
  const doneTasks = useMemo(() => data.tasks.filter((t) => t.done), [data.tasks]);

  const add = () => {
    const t = title.trim();
    if (!t) return;
    actions.addTask({ title: t, notes: notes.trim() || undefined, dueDate: dueDate || undefined, tags: parseTags(tags) });
    setTitle("");
    setNotes("");
    setDueDate("");
    setTags("");
  };

  return (
    <div className="stack">
      <div className="card stack">
        <div className="badge">Tasks</div>
        <h2 className="h2">Small tasks count.</h2>
        <p className="p">If it feels too big, shrink it until it is doable in 2 minutes.</p>

        <div className="field">
          <label className="label" htmlFor="tTitle">Task</label>
          <input id="tTitle" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Write the first sentence" onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        </div>

        <details className="stack">
          <summary className="p" style={{ cursor: "pointer" }}>Optional details</summary>

          <div className="field">
            <label className="label" htmlFor="tNotes">Notes</label>
            <textarea id="tNotes" className="textarea" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Anything future-you should know" />
          </div>

          <div className="row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ minWidth: 220, flex: 1 }}>
              <label className="label" htmlFor="tDue">Due date</label>
              <input id="tDue" className="input" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              <div className="mini">Dates are optional. Blank is allowed.</div>
            </div>

            <div className="field" style={{ minWidth: 220, flex: 1 }}>
              <label className="label" htmlFor="tTags">Tags (comma separated)</label>
              <input id="tTags" className="input" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Example: admin, writing" />
            </div>
          </div>
        </details>

        <div className="row" style={{ justifyContent: "flex-end" }}>
          <button className="btn primary" onClick={add}>Add</button>
        </div>
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="h2">Open</h3>
          <span className="badge">{openTasks.length}</span>
        </div>

        {openTasks.length === 0 ? (
          <p className="p">No open tasks.</p>
        ) : (
          <div className="stack">
            {openTasks.map((t) => (
              <div key={t.id} className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                <label className="row" style={{ alignItems: "flex-start", flex: 1 }}>
                  <input type="checkbox" checked={t.done} onChange={() => actions.toggleTaskDone(t.id)} />
                  <div className="stack" style={{ gap: 2 }}>
                    <div>{t.title}</div>
                    <div className="p">
                      {t.dueDate ? `Due ${t.dueDate === todayISO() ? "today" : t.dueDate}` : "No due date"}
                      {t.tags.length ? ` • Tags: ${t.tags.join(", ")}` : ""}
                      {t.notes ? ` • ${t.notes}` : ""}
                    </div>
                  </div>
                </label>
                <button className="btn danger" onClick={() => actions.deleteTask(t.id)}>Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card stack">
        <div className="row" style={{ justifyContent: "space-between" }}>
          <h3 className="h2">Done</h3>
          <span className="badge">{doneTasks.length}</span>
        </div>

        {doneTasks.length === 0 ? (
          <p className="p">Nothing marked done yet. That is not a crime.</p>
        ) : (
          <div className="stack">
            {doneTasks.slice(0, 16).map((t) => (
              <div key={t.id} className="row" style={{ justifyContent: "space-between" }}>
                <label className="row" style={{ alignItems: "flex-start", flex: 1 }}>
                  <input type="checkbox" checked={t.done} onChange={() => actions.toggleTaskDone(t.id)} />
                  <div className="stack" style={{ gap: 2 }}>
                    <div>{t.title}</div>
                    <div className="p">{t.dueDate ? `Due ${t.dueDate}` : "No due date"}</div>
                  </div>
                </label>
                <button className="btn" onClick={() => actions.deleteTask(t.id)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
