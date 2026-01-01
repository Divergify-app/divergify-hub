import { useEffect, useMemo, useState } from "react";
import type { Task } from "../state/types";
import { formatCountdown, nowIso } from "../shared/utils";
import { useApp } from "../state/useApp";

type Status = "idle" | "running" | "paused" | "done";

const DURATIONS = [5, 10, 15, 25];

export function FocusTimer(props: { openTasks: Task[] }) {
  const { openTasks } = props;
  const { actions } = useApp();

  const [status, setStatus] = useState<Status>("idle");
  const [minutes, setMinutes] = useState(10);
  const [targetId, setTargetId] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [note, setNote] = useState("");

  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const targetLabel = useMemo(() => {
    if (targetId === "__custom__") return customLabel.trim() || "Custom focus";
    const t = openTasks.find((x) => x.id === targetId);
    return t?.title || "";
  }, [targetId, customLabel, openTasks]);

  const reset = () => {
    setStatus("idle");
    setStartedAt(null);
    setEndedAt(null);
    setEndsAt(0);
    setRemainingSeconds(0);
    setNote("");
  };

  const finishSession = (outcome: "done" | "stopped" | "abandoned") => {
    if (startedAt && targetLabel) {
      actions.addFocusSession({
        label: targetLabel,
        minutesPlanned: minutes,
        startedAt,
        endedAt: endedAt ?? nowIso(),
        outcome,
        notes: note.trim() || undefined
      });
    }
    reset();
  };

  const start = () => {
    const dur = Math.max(1, Math.floor(minutes));
    setStartedAt(nowIso());
    setEndedAt(null);
    const end = Date.now() + dur * 60_000;
    setEndsAt(end);
    setRemainingSeconds(dur * 60);
    setNote("");
    setStatus("running");
  };

  const stop = () => finishSession("stopped");
  const pause = () => setStatus("paused");
  const resume = () => {
    const end = Date.now() + remainingSeconds * 1000;
    setEndsAt(end);
    setStatus("running");
  };

  useEffect(() => {
    if (status !== "running") return;

    const tick = () => {
      const secs = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemainingSeconds(secs);
      if (secs <= 0) {
        setStatus("done");
        setEndedAt(nowIso());
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [status, endsAt]);

  const canStart = Boolean(targetId) && (targetId !== "__custom__" || Boolean(customLabel.trim()));

  return (
    <div className="card stack" aria-label="Focus timer">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="badge">Focus</div>
          <h3 className="h2">One target. One timer. No side quests.</h3>
          <p className="p">When it ends, you either stop or choose another sprint. No infinite grind.</p>
        </div>
        <div className="badge">{status.toUpperCase()}</div>
      </div>

      {status === "idle" ? (
        <>
          <div className="row" style={{ flexWrap: "wrap" }}>
            <div className="field" style={{ minWidth: 240, flex: 1 }}>
              <label className="label" htmlFor="focusTarget">Target</label>
              <select id="focusTarget" className="select" value={targetId} onChange={(e) => setTargetId(e.target.value)}>
                <option value="">Select...</option>
                {openTasks.slice(0, 40).map((t) => (
                  <option key={t.id} value={t.id}>{t.title.slice(0, 90)}</option>
                ))}
                <option value="__custom__">Custom...</option>
              </select>
            </div>

            <div className="field" style={{ width: 180 }}>
              <label className="label" htmlFor="focusMinutes">Minutes</label>
              <select id="focusMinutes" className="select" value={minutes} onChange={(e) => setMinutes(Number(e.target.value))}>
                {DURATIONS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {targetId === "__custom__" ? (
            <div className="field">
              <label className="label" htmlFor="customLabel">Custom label</label>
              <input id="customLabel" className="input" value={customLabel} onChange={(e) => setCustomLabel(e.target.value)} placeholder="Example: Write 3 bullets" />
            </div>
          ) : null}

          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn primary" onClick={start} disabled={!canStart}>Start</button>
          </div>
        </>
      ) : (
        <>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap" }}>
            <div className="stack" style={{ gap: 6, flex: 1, minWidth: 240 }}>
              <div className="badge">Target</div>
              <div style={{ fontWeight: 700 }}>{targetLabel}</div>
              <div className="p">Do the smallest next action. Ignore the rest.</div>
            </div>
            <div className="card" style={{ padding: "12px 14px", minWidth: 150, textAlign: "center" }}>
              <div className="badge">Time left</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{formatCountdown(remainingSeconds)}</div>
            </div>
          </div>

          <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
            <div className="row" style={{ flexWrap: "wrap" }}>
              {status === "running" ? <button className="btn" onClick={pause}>Pause</button> : null}
              {status === "paused" ? <button className="btn primary" onClick={resume}>Resume</button> : null}
              {status !== "done" ? <button className="btn" onClick={stop}>Stop</button> : null}
            </div>

            {status === "done" ? (
              <button className="btn primary" onClick={() => finishSession("done")}>Close sprint</button>
            ) : null}
          </div>

          <div className="field">
            <label className="label" htmlFor="focusNote">Wrap-up note (optional)</label>
            <textarea
              id="focusNote"
              className="textarea"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Example: Wrote 2 bullets, next step is to outline the intro."
            />
          </div>

          {status === "done" ? (
            <div className="notice">
              Sprint complete. Write one line: what changed? Then stop or choose the next sprint on purpose.
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
