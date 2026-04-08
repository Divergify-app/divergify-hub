import { useLocation } from "react-router-dom";
import { useApp } from "../state/useApp";
import { useSessionState } from "../state/sessionState";
import { getSupportProfile } from "../shared/supportProfile";
import { TakotaStatus } from "./TakotaStatus";
import { BrandMark } from "./BrandMark";
import { BrandWordmark } from "./BrandWordmark";
import { getSidekick } from "../sidekicks/defs";

type Props = {
  onOpenState?: () => void;
};

const COPY: Array<{ match: (pathname: string) => boolean; title: string; subtitle: string }> = [
  {
    match: (pathname) => pathname === "/",
    title: "Today",
    subtitle: "What matters next, not all at once."
  },
  {
    match: (pathname) => pathname.startsWith("/tasks"),
    title: "Planner",
    subtitle: "See what matters, park the rest, and come back in cleanly."
  },
  {
    match: (pathname) => pathname.startsWith("/brain-dump"),
    title: "Brain Dump",
    subtitle: "Get it out first. Sort it after."
  },
  {
    match: (pathname) => pathname.startsWith("/focus"),
    title: "Focus",
    subtitle: "Pick one thing. Start small. Stop clean."
  },
  {
    match: (pathname) => pathname.startsWith("/calendar"),
    title: "Calendar",
    subtitle: "Move work into time without turning the day into a cage."
  },
  {
    match: (pathname) => pathname.startsWith("/magic-tasks"),
    title: "Magic Tasks",
    subtitle: "Shrink the scary thing until it has a start."
  },
  {
    match: (pathname) => pathname.startsWith("/sidekicks"),
    title: "Sidekicks",
    subtitle: "Choose the voice that helps without making things worse."
  },
  {
    match: (pathname) => pathname.startsWith("/habits"),
    title: "Habits",
    subtitle: "Tiny repeats still count."
  },
  {
    match: (pathname) => pathname.startsWith("/feedback"),
    title: "Support",
    subtitle: "Report the problem clearly. Keep the fix path short."
  },
  {
    match: (pathname) => pathname.startsWith("/settings"),
    title: "Settings",
    subtitle: "Tune the environment. Keep the friction low."
  },
  {
    match: () => true,
    title: "Divergify",
    subtitle: "For brains that zig when the world zags."
  }
];

export function TopBar({ onOpenState }: Props) {
  const { data, actions } = useApp();
  const { session, checkInRequired } = useSessionState();
  const location = useLocation();

  const profile = session ? getSupportProfile(session.overwhelm) : null;
  const stateNeedsAttention = checkInRequired || !profile;
  const currentCopy = COPY.find((entry) => entry.match(location.pathname)) ?? COPY[COPY.length - 1];
  const focusArea = data.onboardingProfile?.focusArea || "Adaptive planning";
  const openTaskCount = data.tasks.filter((task) => !task.done).length;
  const systemsOn = data.preferences.systems;
  const activeSidekick = getSidekick(data.activeSidekickId);

  return (
    <div className="topbar panel">
      <div className="topbar-copy">
        <div className="topbar-brand-row">
          <div className="topbar-brand-mark-shell">
            <BrandMark className="topbar-brand-mark" />
          </div>
          <BrandWordmark className="topbar-wordmark" />
          <div className="badge">{currentCopy.title}</div>
        </div>
        <div className="topbar-title">{currentCopy.subtitle}</div>
        <div className="topbar-meta-row">
          <span className="topbar-meta-pill">{focusArea}</span>
          <span className="topbar-meta-pill">{openTaskCount} open tasks</span>
          <span className="topbar-meta-pill">{profile?.label ?? "Check-in pending"}</span>
        </div>
      </div>

      <div className="topbar-actions">
        <TakotaStatus />
        <button className={`btn ${stateNeedsAttention ? "primary" : ""}`} onClick={onOpenState}>
          {stateNeedsAttention ? "Run check-in" : `Support: ${profile?.label ?? "set"}`}
        </button>
        <button className="btn" onClick={() => actions.setSidekickDrawerOpen(true)}>
          Talk to {activeSidekick.name}
        </button>
        <button
          className={`toggle-chip ${systemsOn ? "is-on" : ""}`}
          onClick={actions.toggleSystems}
          role="switch"
          aria-checked={systemsOn}
        >
          <span>Systems</span>
          <span className="toggle-chip-state">{systemsOn ? "ON" : "OFF"}</span>
        </button>
        <button
          className={`toggle-chip ${data.preferences.shades ? "is-on" : ""}`}
          onClick={actions.toggleShades}
          role="switch"
          aria-checked={data.preferences.shades}
        >
          <span>Shades</span>
          <span className="toggle-chip-state">{data.preferences.shades ? "ON" : "OFF"}</span>
        </button>
        <button
          className={`toggle-chip ${data.preferences.tinFoil ? "is-on" : ""}`}
          onClick={actions.toggleTinFoil}
          role="switch"
          aria-checked={data.preferences.tinFoil}
        >
          <span>Tinfoil Hat</span>
          <span className="toggle-chip-state">{data.preferences.tinFoil ? "ON" : "OFF"}</span>
        </button>
      </div>
    </div>
  );
}
