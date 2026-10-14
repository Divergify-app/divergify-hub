import { Link, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useApp } from "../state/useApp";
import { TakotaCheckIn } from "../components/TakotaCheckIn";
import { useSessionState } from "../state/sessionState";
import { getSupportProfile } from "../shared/supportProfile";
import { SidekickDrawer } from "../components/SidekickDrawer";

const tools = [
  ["/today", "Today"], ["/tasks", "Tasks"], ["/calendar", "Calendar"],
  ["/brain-dump", "Sort a written dump"], ["/focus", "Focus"], ["/habits", "Habits"],
  ["/sidekicks", "Sidekicks"], ["/settings", "Settings"], ["/feedback", "Feedback"]
];

export function Shell() {
  const { hydrated, data, actions } = useApp();
  const { session } = useSessionState();
  const location = useLocation();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const menu = useRef<HTMLDetailsElement>(null);
  const appliedSessionAtRef = useRef<string | null>(null);

  useEffect(() => { if (menu.current) menu.current.open = false; }, [location.pathname]);
  useEffect(() => {
    if (!session || appliedSessionAtRef.current === session.setAt) return;
    appliedSessionAtRef.current = session.setAt;
    const profile = getSupportProfile(session.overwhelm);
    if (profile.autoEnableShades || profile.autoReduceMotion) {
      actions.setPreferences({ ...data.preferences,
        shades: profile.autoEnableShades || data.preferences.shades,
        reduceMotion: profile.autoReduceMotion || data.preferences.reduceMotion });
    }
  }, [actions, data.preferences, session]);

  if (!hydrated) return <main className="talk-loading" aria-busy="true">Opening Takota…</main>;

  return (
    <div className="conversation-shell">
      <TakotaCheckIn open={checkInOpen} onClose={() => setCheckInOpen(false)} />
      <header className="conversation-header">
        <Link to="/" className="conversation-brand">Divergify</Link>
        <details ref={menu} className="conversation-tools">
          <summary>Tools</summary>
          <nav aria-label="Tools">
            <Link to="/">Talk to Takota</Link>
            {tools.map(([to, label]) => <Link key={to} to={to}>{label}</Link>)}
            <button type="button" onClick={() => { if (menu.current) menu.current.open = false; setCheckInOpen(true); }}>Adjust support</button>
          </nav>
        </details>
      </header>
      <main id="main" className={location.pathname === "/" ? "conversation-main" : "conversation-tool-page"}>
        <Outlet context={{ openCheckIn: () => setCheckInOpen(true) }} />
      </main>
      {location.pathname !== "/" ? <SidekickDrawer /> : null}
    </div>
  );
}
