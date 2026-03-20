import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { TopBar } from "../components/TopBar";
import { Tabs } from "../components/Tabs";
import { SidekickDrawer } from "../components/SidekickDrawer";
import { BrandMark } from "../components/BrandMark";
import { BrandWordmark } from "../components/BrandWordmark";
import { useApp } from "../state/useApp";
import { TakotaCheckIn } from "../components/TakotaCheckIn";
import { useSessionState } from "../state/sessionState";
import { getSupportProfile } from "../shared/supportProfile";
import { todayISO } from "../shared/utils";

export function Shell() {
  const { hydrated, data, actions } = useApp();
  const loc = useLocation();
  const { session, checkInRequired } = useSessionState();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const appliedSessionAtRef = useRef<string | null>(null);
  const canOpenWithoutOnboarding =
    loc.pathname === "/onboarding" ||
    loc.pathname === "/brain-dump" ||
    loc.pathname === "/feedback" ||
    loc.pathname === "/legal/privacy" ||
    loc.pathname === "/legal/terms";
  const setupMode = !data.hasOnboarded;
  const today = todayISO();
  const openTasks = data.tasks.filter((task) => !task.done);
  const dueNowCount = openTasks.filter((task) => task.dueDate && task.dueDate <= today).length;
  const focusTodayCount = data.focus.filter((entry) => entry.startedAt.slice(0, 10) === today).length;
  const supportProfile = getSupportProfile(session?.overwhelm ?? 50);
  const systemsOn = data.activeSidekickId === "systems";

  useEffect(() => {
    if (!session) {
      appliedSessionAtRef.current = null;
      return;
    }
    if (appliedSessionAtRef.current === session.setAt) return;
    appliedSessionAtRef.current = session.setAt;

    const profile = getSupportProfile(session.overwhelm);
    if (!profile.autoEnableShades && !profile.autoReduceMotion) return;

    const desiredShades = profile.autoEnableShades || data.preferences.shades;
    const desiredReduceMotion = profile.autoReduceMotion || data.preferences.reduceMotion;
    if (data.preferences.shades === desiredShades && data.preferences.reduceMotion === desiredReduceMotion) return;

    actions.setPreferences({
      ...data.preferences,
      shades: desiredShades,
      reduceMotion: desiredReduceMotion
    });
  }, [actions, data.preferences, session]);

  useEffect(() => {
    if (!hydrated || !data.hasOnboarded) return;
    if (!checkInRequired) return;
    setCheckInOpen(true);
  }, [checkInRequired, data.hasOnboarded, hydrated]);

  if (!hydrated) {
    return (
      <div className="container">
        <div className="panel" style={{ padding: 22 }}>
          <p className="p">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data.hasOnboarded && !canOpenWithoutOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (setupMode) {
    return (
      <div className="setup-frame">
        <TakotaCheckIn open={checkInOpen} onClose={() => setCheckInOpen(false)} />

        <div className="setup-shell">
          <section className="setup-hero panel stack">
            <div className="setup-brand-row">
              <div className="setup-brand-copy">
                <div className="badge">Divergify</div>
                <div className="setup-lockup">
                  <div className="setup-brand-mark-shell">
                    <BrandMark className="setup-brand-mark" />
                  </div>
                  <BrandWordmark className="setup-wordmark" />
                </div>
              </div>
              <div className="stack" style={{ gap: 10, minWidth: 0 }}>
                <h1 className="setup-title">For brains that zig when the world zags.</h1>
                <p className="p">
                  Divergify is a planner for neurodivergent brains: quick capture, clear next steps, and enough
                  support to help without turning the app into more noise.
                </p>
                <div className="setup-action-row">
                  <button
                    className={`btn ${systemsOn ? "primary" : ""}`}
                    onClick={() => actions.setActiveSidekickId(systemsOn ? "takota" : "systems")}
                    aria-pressed={systemsOn}
                  >
                    Systems {systemsOn ? "ON" : "OFF"}
                  </button>
                  <button
                    className={`btn ${data.preferences.shades ? "primary" : ""}`}
                    onClick={actions.toggleShades}
                    aria-pressed={data.preferences.shades}
                  >
                    Shades {data.preferences.shades ? "ON" : "OFF"}
                  </button>
                  <button
                    className={`btn ${data.preferences.tinFoil ? "primary" : ""}`}
                    onClick={actions.toggleTinFoil}
                    aria-pressed={data.preferences.tinFoil}
                  >
                    Tinfoil Hat {data.preferences.tinFoil ? "ON" : "OFF"}
                  </button>
                </div>
              </div>
            </div>

            <div className="setup-feature-grid">
              <div className="setup-feature-card">
                <span className="metric-label">Adaptive pacing</span>
                <strong>{supportProfile.label}</strong>
                <span className="mini">Daily check-ins tune sprint length, task cap, and nudge pace before the list gets louder than the work.</span>
              </div>
              <div className="setup-feature-card">
                <span className="metric-label">Local-first</span>
                <strong>Private by default</strong>
                <span className="mini">Tasks, habits, focus history, and sidekick chat stay on the device.</span>
              </div>
              <div className="setup-feature-card">
                <span className="metric-label">Phone-ready</span>
                <strong>{openTasks.length} active items</strong>
                <span className="mini">Built for tap-sized planning, quick entry, and smooth Android packaging.</span>
              </div>
            </div>

            <div className="setup-action-row">
              {loc.pathname !== "/brain-dump" ? (
                <Link to="/brain-dump" className="btn" style={{ textDecoration: "none" }}>
                  Quick brain dump
                </Link>
              ) : null}
              <button className={`btn ${checkInRequired ? "primary" : ""}`} onClick={() => setCheckInOpen(true)}>
                {checkInRequired ? "Run check-in" : `Support: ${supportProfile.label}`}
              </button>
            </div>
          </section>

          <main id="main" className="setup-content">
            <Outlet context={{ openCheckIn: () => setCheckInOpen(true) }} />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="app-frame">
      <TakotaCheckIn open={checkInOpen} onClose={() => setCheckInOpen(false)} />

      <aside className="nav-rail">
        <div className="workspace-card stack nav-brand-card">
          <div className="badge">Divergify</div>
          <div className="nav-brand-lockup">
            <div className="nav-brand-mark-shell">
              <BrandMark className="nav-brand-mark" />
            </div>
            <BrandWordmark className="nav-wordmark" />
          </div>
          <h1 className="h2">For brains that zig when the world zags.</h1>
          <p className="p">
            A human planner for messy days, clear starts, and getting back in without rebuilding your whole brain.
          </p>

          <div className="nav-brand-stats">
            <div className="nav-brand-stat">
              <span className="metric-label">Open</span>
              <strong>{openTasks.length}</strong>
            </div>
            <div className="nav-brand-stat">
              <span className="metric-label">Due now</span>
              <strong>{dueNowCount}</strong>
            </div>
            <div className="nav-brand-stat">
              <span className="metric-label">Focus</span>
              <strong>{focusTodayCount}</strong>
            </div>
          </div>

          <div className="notice">
            <strong>{supportProfile.label}</strong> support is active. Tinfoil Hat and Shades stay close for quick
            environment changes.
          </div>
        </div>
        <Tabs variant="sidebar" />
      </aside>

      <div className="app-main">
        <TopBar onOpenState={() => setCheckInOpen(true)} />
        <main id="main" className="app-content">
          <Outlet context={{ openCheckIn: () => setCheckInOpen(true) }} />
        </main>
        <Tabs variant="bottom" />
      </div>

      <SidekickDrawer />
    </div>
  );
}
