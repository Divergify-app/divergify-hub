import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { TakotaAvatar } from "../components/TakotaAvatar";
import { appointmentPrompt, localConversationReply, nextAppointment } from "../shared/conversation";
import { useConversationVoice } from "../shared/useConversationVoice";
import { nowIso, uid } from "../shared/utils";
import { useApp } from "../state/useApp";
import { getSidekick } from "../sidekicks/defs";

export function Conversation() {
  const { data, actions } = useApp();
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("Go ahead. What’s on your mind?");
  const [lastMessage, setLastMessage] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [saved, setSaved] = useState(false);
  const [replyAloud, setReplyAloud] = useState(false);
  const [voiceConsent, setVoiceConsent] = useState(false);
  const [consentOpen, setConsentOpen] = useState(false);
  const [clock, setClock] = useState(() => new Date());
  const consentDialog = useRef<HTMLDialogElement>(null);
  const consentOpener = useRef<HTMLButtonElement>(null);
  const voiceIntent = useRef<"listen" | "speak">("listen");
  const reminded = useRef(new Set<string>());
  const submitRef = useRef<(text: string) => void>(() => undefined);
  const { listening, speaking, draft, notice, start, finish, silence, speak } = useConversationVoice(text => submitRef.current(text), data.preferences.tinFoil);

  const submit = (text: string) => {
    const clean = text.trim();
    if (!clean) return;
    silence();
    const answer = localConversationReply(clean, data);
    actions.pushChat({ id: uid(), role: "user", sidekickId: "takota", content: clean, ts: nowIso() });
    actions.pushChat({ id: uid(), role: "assistant", sidekickId: "takota", content: answer, ts: nowIso() });
    setMessage("");
    setLastMessage(clean);
    setTaskTitle(clean);
    setSaved(false);
    setReply(answer);
    if (replyAloud && voiceConsent && !data.preferences.tinFoil) speak(answer);
  };
  submitRef.current = submit;

  useEffect(() => {
    const timer = window.setInterval(() => setClock(new Date()), 30_000);
    const refresh = () => { if (!document.hidden) setClock(new Date()); };
    document.addEventListener("visibilitychange", refresh);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", refresh); };
  }, []);

  const next = nextAppointment(data.tasks, clock);
  const nudge = next && next.minutesAway <= 120 ? appointmentPrompt(next) : null;
  const nudgeKey = next ? `${next.task.id}:${next.task.startAt}` : null;
  useEffect(() => {
    if (!nudge || !nudgeKey || !replyAloud || !voiceConsent || listening || speaking || document.hidden || data.preferences.tinFoil || reminded.current.has(nudgeKey)) return;
    reminded.current.add(nudgeKey);
    speak(nudge);
  }, [nudge, nudgeKey, replyAloud, voiceConsent, listening, speaking, data.preferences.tinFoil, speak]);

  useEffect(() => {
    if (consentOpen) consentDialog.current?.showModal();
    else if (consentDialog.current?.open) consentDialog.current.close();
  }, [consentOpen]);

  const closeConsent = () => {
    setConsentOpen(false);
    consentOpener.current?.focus();
  };
  const talk = () => {
    if (listening) { finish(); return; }
    if (!voiceConsent) { voiceIntent.current = "listen"; setConsentOpen(true); return; }
    setReplyAloud(true);
    void start();
  };
  const hearReply = () => {
    if (!voiceConsent) { voiceIntent.current = "speak"; setConsentOpen(true); return; }
    setReplyAloud(true);
    speak(reply);
  };

  return (
    <section className="takota-conversation" aria-label="Talk to Takota">
      <div className="talk-intro">
        <span className="talk-service">Basic help · on device</span>
        <TakotaAvatar className="talk-avatar" privacy={data.preferences.tinFoil ? "tinfoil" : "off"} />
        <h1>Takota</h1>
        <p className="talk-reply" aria-live="polite" aria-atomic="true">{reply}</p>
      </div>

      {nudge ? <aside className="talk-appointment" aria-label="Upcoming appointment">
        <p>{nudge}</p><Link to="/calendar">Open calendar</Link>
      </aside> : null}

      <div className="talk-controls">
        <button ref={consentOpener} className={`talk-button ${listening ? "is-listening" : ""}`} onClick={talk} disabled={data.preferences.tinFoil} aria-pressed={listening}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="12" rx="3" /><path d="M5 11v1a7 7 0 0 0 14 0v-1M12 19v3M8 22h8" /></svg>
          {listening ? "Done talking" : "Talk to Takota"}
        </button>
        <span className="talk-status" role="status">{listening ? "Listening… take your time." : speaking ? "Takota is speaking." : ""}</span>
        <div className="talk-audio-actions">
          <button className="btn" onClick={hearReply} disabled={listening || data.preferences.tinFoil}>Hear reply</button>
          {(listening || speaking) ? <button className="btn" onClick={silence}>Stop voice</button> : null}
          {replyAloud ? <button className="btn" onClick={() => { setReplyAloud(false); silence(); }}>Mute replies</button> : null}
        </div>
      </div>

      {data.preferences.tinFoil ? <p className="mini" role="status">Tinfoil Hat is on. Voice is off; typing works.</p> : null}
      {notice ? <p className="talk-notice" role="status">{notice}</p> : null}
      {draft ? <details className="talk-details"><summary>Your captured words</summary><p>{draft}</p><button className="btn" onClick={() => setMessage(draft)}>Edit as text</button></details> : null}

      <details className="talk-details">
        <summary>Type instead</summary>
        <form onSubmit={event => { event.preventDefault(); submit(message); }}>
          <label className="label" htmlFor="talk-message">What’s on your mind?</label>
          <textarea id="talk-message" className="textarea" value={message} onChange={event => setMessage(event.target.value)} />
          <button className="btn primary" type="submit" disabled={!message.trim() || listening}>Send</button>
        </form>
      </details>

      {lastMessage ? <details className="talk-details">
        <summary>{saved ? "Saved to Tasks" : "Save something from this"}</summary>
        <label className="label" htmlFor="talk-task">Edit before saving</label>
        <textarea id="talk-task" className="textarea" value={taskTitle} onChange={event => setTaskTitle(event.target.value)} disabled={saved} />
        <button className="btn" disabled={saved || !taskTitle.trim()} onClick={() => { if (actions.addTask({ title: taskTitle, project: "Inbox" })) setSaved(true); }}>{saved ? "Saved" : "Save as task"}</button>
      </details> : null}

      <details className="talk-details">
        <summary>Conversation</summary>
        {data.chat.map(turn => <p key={turn.id}><strong>{turn.role === "user" ? "You" : getSidekick(turn.sidekickId).name}:</strong> {turn.content}</p>)}
      </details>
      <p className="talk-limit">Live AI and outside calendar connection aren’t active in this preview.</p>

      <dialog ref={consentDialog} className="talk-consent" aria-labelledby="voice-title" onCancel={() => closeConsent()} onClose={() => setConsentOpen(false)}>
        <h2 id="voice-title">Use voice?</h2>
        <p>Your device or browser may process speech online. Captured words stay in your local conversation. Voice stops when you leave this screen.</p>
        <div className="row">
          <button className="btn primary" autoFocus onClick={() => { closeConsent(); setVoiceConsent(true); setReplyAloud(true); if (voiceIntent.current === "speak") speak(reply); else void start(); }}>Use voice</button>
          <button className="btn" onClick={closeConsent}>Type instead</button>
        </div>
      </dialog>
    </section>
  );
}
