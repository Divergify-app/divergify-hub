import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { TopBar } from "../components/TopBar";
import { Tabs } from "../components/Tabs";
import { SidekickDrawer } from "../components/SidekickDrawer";
import { useApp } from "../state/useApp";
import { TakotaCheckIn } from "../components/TakotaCheckIn";
import { useSessionState } from "../state/sessionState";
import { getSupportProfile } from "../shared/supportProfile";

export function Shell() {
  const { hydrated, data, actions } = useApp();
  const loc = useLocation();
  const { session } = useSessionState();
  const [checkInOpen, setCheckInOpen] = useState(false);
  const appliedSessionAtRef = useRef<string | null>(null);

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

  if (!hydrated) {
    return (
      <div className="container">
        <div className="panel" style={{ padding: 22 }}>
          <p className="p">Loading...</p>
        </div>
      </div>
    );
  }

  if (!data.hasOnboarded && loc.pathname !== "/onboarding") {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <div className="container">
      <TopBar onOpenState={() => setCheckInOpen(true)} />
      <TakotaCheckIn open={checkInOpen} onClose={() => setCheckInOpen(false)} />
      <Tabs />
      <main id="main" className="panel" style={{ padding: "18px", marginTop: "16px" }}>
        <Outlet />
      </main>
      <SidekickDrawer />
    </div>
  );
}
