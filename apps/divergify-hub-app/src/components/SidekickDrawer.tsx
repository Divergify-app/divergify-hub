import { useMemo, useState } from "react";
import { useApp } from "../state/useApp";
import { mapOverwhelmToSupportLevel, useSessionState } from "../state/sessionState";
import { TakotaAvatar } from "./TakotaAvatar";
import { SIDEKICKS, getSidekick } from "../sidekicks/defs";
import { nowIso, uid } from "../shared/utils";
import { requestSidekickTurn } from "../shared/sidekickAssist";
import { getSupportProfile } from "../shared/supportProfile";

function withinLastHour(ts: string) {
  const t = Date.parse(ts);
  if (!Number.isFinite(t)) return false;
  return Date.now() - t <= 60 * 60 * 1000;
}

export function SidekickDrawer() {
  const { data, actions } = useApp();
  const { session } = useSessionState();
  const open = data.ui.sidekickDrawerOpen;

  const sidekick = useMemo(() => getSidekick(data.activeSidekickId), [data.activeSidekickId]);
  const [msg, setMsg] = useState("");
  const [assistNotice, setAssistNotice] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const loopGuard = data.preferences.loopGuard;
  const userMsgsLastHour = useMemo(
    () => data.chat.filter((t) => t.role === "user" && withinLastHour(t.ts)).length,
    [data.chat]
  );
  const [breakUntil, setBreakUntil] = useState<number>(0);
  const now = Date.now();
  const inBreak = now < breakUntil;
  const overLimit = loopGuard.enabled && userMsgsLastHour >= loopGuard.softLimitPerHour && !inBreak;

  const send = async () => {
    const text = msg.trim();
    if (!text || inBreak || isThinking) return;

    actions.pushChat({
      id: uid(),
      role: "user",
      sidekickId: data.activeSidekickId,
      content: text,
      ts: nowIso()
    });

    setMsg("");
    setIsThinking(true);
    try {
      const result = await requestSidekickTurn({
        message: text,
        data,
        supportLevel,
        sidekickId: data.activeSidekickId
      });
      actions.pushChat(result.turn);
      setAssistNotice(
        result.source === "local" && !data.preferences.tinFoil && result.error
          ? `Cloud assist was unavailable, so ${sidekick.name} stayed local.`
          : null
      );
    } finally {
      setIsThinking(false);
    }
  };

  const wrapUp = async () => {
    const text = "Wrap up: 3 bullets, one next micro-step, and tell me to close the app.";
    if (isThinking) return;
    actions.pushChat({ id: uid(), role: "user", sidekickId: data.activeSidekickId, content: text, ts: nowIso() });
    setIsThinking(true);
    try {
      const result = await requestSidekickTurn({
        message: text,
        data,
        supportLevel,
        sidekickId: data.activeSidekickId
      });
      actions.pushChat(result.turn);
      setAssistNotice(
        result.source === "local" && !data.preferences.tinFoil && result.error
          ? `Cloud assist was unavailable, so ${sidekick.name} stayed local.`
          : null
      );
    } finally {
      setIsThinking(false);
    }
  };

  const startBreak = () => {
    const mins = Math.max(1, loopGuard.cooldownMinutes);
    setBreakUntil(Date.now() + mins * 60_000);
  };

  const mode = data.preferences.shades ? "shades" : "default";
  const privacy = data.preferences.tinFoil ? "tinfoil" : "off";
  const supportLevel = session ? mapOverwhelmToSupportLevel(session.overwhelm) : "normal";
  const supportProfile = getSupportProfile(session?.overwhelm ?? 50);

  return (
    <>
      <button
        className="fab"
        onClick={() => actions.setSidekickDrawerOpen(true)}
        aria-label="Open sidekicks"
      >
        <TakotaAvatar mode={mode} privacy={privacy} />
        <span style={{ fontWeight: 700 }}>Sidekicks</span>
      </button>

      {open ? (
        <div className="drawer-backdrop" role="presentation" onClick={() => actions.setSidekickDrawerOpen(false)}>
          <div className="drawer" role="dialog" aria-label="Sidekick drawer" onClick={(e) => e.stopPropagation()}>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <div className="stack" style={{ gap: 6 }}>
                <div className="badge">Active</div>
                <div style={{ fontWeight: 800 }}>{sidekick.name}</div>
                <div className="p">{sidekick.tagline}</div>
                <div className="mini">Support profile: {supportProfile.label}</div>
                <div className="mini">{supportProfile.description}</div>
              </div>
              <button className="btn" onClick={() => actions.setSidekickDrawerOpen(false)}>Close</button>
            </div>

            <hr className="sep" />

            <div className="field">
              <label className="label" htmlFor="sidekickSelect">Switch personality</label>
              <select
                id="sidekickSelect"
                className="select"
                value={data.activeSidekickId}
                onChange={(e) => actions.setActiveSidekickId(e.target.value as any)}
              >
                {SIDEKICKS.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {data.preferences.tinFoil ? (
              <div className="notice privacy">
                Tinfoil Hat is on. Integrations are disabled. This chat stays local-only.
              </div>
            ) : null}

            {assistNotice ? <div className="notice">{assistNotice}</div> : null}

            {overLimit ? (
              <div className="notice">
                Quick check: you have sent {userMsgsLastHour} messages in the last hour.
                If you are looping, that is a pattern, not a personal failure.
                <div className="row" style={{ marginTop: 10, flexWrap: "wrap" }}>
                  <button className="btn primary" onClick={startBreak}>Take a short break</button>
                  <button className="btn" onClick={wrapUp}>Wrap up</button>
                </div>
              </div>
            ) : null}

            {inBreak ? (
              <div className="notice">
                Break active. You are allowed to do nothing for a minute.
              </div>
            ) : null}

            {isThinking ? <div className="notice">Sidekick is thinking.</div> : null}

            <div className="chat" aria-label="Chat history">
              {data.chat.map((t) => (
                <div key={t.id} className={`turn ${t.role === "user" ? "user" : ""}`}>
                  <div className="badge">{t.role} • {getSidekick(t.sidekickId).name}</div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{t.content}</div>
                  <div className="mini">{new Date(t.ts).toLocaleString()}</div>
                </div>
              ))}
            </div>

            <div className="row" style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
              <button className="btn" onClick={actions.clearChat}>Clear</button>
              <button className="btn" onClick={() => void wrapUp()} disabled={isThinking}>Wrap up</button>
            </div>

            <div className="field">
              <label className="label" htmlFor="msg">Message</label>
              <textarea
                id="msg"
                className="textarea"
                value={msg}
                onChange={(e) => setMsg(e.target.value)}
                placeholder="Example: I am stuck. What is the smallest next step?"
              />
              <div className="mini">Press Send. Then do one real-world step. This is not an infinite chat pit.</div>
            </div>

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="btn primary" onClick={() => void send()} disabled={!msg.trim() || inBreak || isThinking}>
                {isThinking ? "Thinking..." : "Send"}
              </button>
            </div>

            <div className="mini">
              This app provides productivity support. It is not medical advice, diagnosis, or treatment.
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
