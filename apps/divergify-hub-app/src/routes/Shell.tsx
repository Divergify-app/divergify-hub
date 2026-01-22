import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { TopBar } from "../components/TopBar";
import { Tabs } from "../components/Tabs";
import { SidekickDrawer } from "../components/SidekickDrawer";
import { useApp } from "../state/useApp";
import { TakotaCheckIn } from "../components/TakotaCheckIn";
import { useSessionState } from "../state/sessionState";

export function Shell() {
  const { hydrated, data, actions } = useApp();
  const loc = useLocation();
  const { session, checkInRequired } = useSessionState();
  const [checkInOpen, setCheckInOpen] = useState(checkInRequired);

  useEffect(() => {
    if (checkInRequired) setCheckInOpen(true);
  }, [checkInRequired]);

  useEffect(() => {
    if (!session?.mode) return;
    const desired =
      session.mode === "overloaded"
        ? { shades: true, reduceMotion: true }
        : { shades: false, reduceMotion: false };

    if (
      data.preferences.shades !== desired.shades ||
      data.preferences.reduceMotion !== desired.reduceMotion
    ) {
      actions.setPreferences({ ...data.preferences, ...desired });
    }
  }, [actions, data.preferences, session?.mode]);

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
