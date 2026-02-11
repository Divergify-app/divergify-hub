import { useEffect, useMemo, useState } from "react";
import type { Task } from "../state/types";
import { formatCountdown, nowIso } from "../shared/utils";
import { useApp } from "../state/useApp";
import { getPersonaCopy } from "../sidekicks/copy";
import { mapOverwhelmToSupportLevel, useSessionState } from "../state/sessionState";
import { getSupportProfile } from "../shared/supportProfile";
import { buildFocusNudges } from "../sidekicks/nudges";
import { getSidekick } from "../sidekicks/defs";

type Status = "idle" | "running" | "paused" | "done";

export function FocusTimer(props: { openTasks: Task[] }) {
  const { openTasks } = props;
  const { actions, data } = useApp();
  const { session } = useSessionState();
  const persona = getPersonaCopy(data.activeSidekickId);
  const sidekick = getSidekick(data.activeSidekickId);
  const supportProfile = getSupportProfile(session?.overwhelm ?? 50);
  const supportLevel = session ? mapOverwhelmToSupportLevel(session.overwhelm) : "normal";

  const [status, setStatus] = useState<Status>("idle");
  const [minutes, setMinutes] = useState(supportProfile.focusMinutesDefault);
  const [targetId, setTargetId] = useState("");
  const [customLabel, setCustomLabel] = useState("");
  const [note, setNote] = useState("");
  const [nudge, setNudge] = useState("");

  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [endedAt, setEndedAt] = useState<string | null>(null);
  const [endsAt, setEndsAt] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  const targetLabel = useMemo(() => {
    if (targetId === "__custom__") return customLabel.trim() || "Custom focus";
    const t = openTasks.find((x) => x.id === targetId);
    return t?.title || "";
  }, [targetId, customLabel, openTasks]);

  const nudges = useMemo(
    () => buildFocusNudges(data.activeSidekickId, supportLevel, targetLabel),
    [data.activeSidekickId, supportLevel, targetLabel]
  );

  useEffect(() => {
    if (status !== "idle") return;
    setMinutes((current) =>
      supportProfile.focusDurationOptions.includes(current) ? current : supportProfile.focusMinutesDefault
    );
  }, [status, supportProfile.focusDurationOptions, supportProfile.focusMinutesDefault]);

  const reset = () => {
    setStatus("idle");
    setStartedAt(null);
    setEndedAt(null);
    setEndsAt(0);
    setRemainingSeconds(0);
    setNote("");
    setNudge("");
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

  useEffect(() => {
    if (status !== "running") {
      setNudge("");
      return;
    }
    if (!nudges.length) return;

    let idx = 0;
    setNudge(nudges[idx]);
    const id = window.setInterval(() => {
      idx = (idx + 1) % nudges.length;
      setNudge(nudges[idx]);
    }, supportProfile.nudgeIntervalSeconds * 1000);
    return () => window.clearInterval(id);
  }, [nudges, status, supportProfile.nudgeIntervalSeconds]);

  const canStart = Boolean(targetId) && (targetId !== "__custom__" || Boolean(customLabel.trim()));

  return (
    <div className="card stack" aria-label="Focus timer">
      <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: 6 }}>
          <div className="badge">Focus</div>
          <h3 className="h2">{persona.focusTimerHeading}</h3>
          <p className="p">{persona.focusTimerSub}</p>
          <div className="mini">
            Support profile: {supportProfile.label}. Suggested sprint: {supportProfile.focusMinutesDefault} minutes.
          </div>
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
                {supportProfile.focusDurationOptions.map((m) => <option key={m} value={m}>{m}</option>)}
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
              <div className="p">{persona.focusRunningHint}</div>
            </div>
            <div className="card" style={{ padding: "12px 14px", minWidth: 150, textAlign: "center" }}>
              <div className="badge">Time left</div>
              <div style={{ fontSize: 28, fontWeight: 800 }}>{formatCountdown(remainingSeconds)}</div>
            </div>
          </div>

          {status === "running" && nudge ? (
            <div className="notice">
              <strong>{sidekick.name} nudge:</strong> {nudge}
            </div>
          ) : null}

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
              {persona.focusDoneNotice}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
