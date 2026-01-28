import { Navigate, Outlet, useLocation } from "react-router-dom";
import { TopBar } from "../components/TopBar";
import { Tabs } from "../components/Tabs";
import { SidekickDrawer } from "../components/SidekickDrawer";
import { useApp } from "../state/useApp";

export function Shell() {
  const { hydrated, data } = useApp();
  const loc = useLocation();

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
      <TopBar />
      <Tabs />
      <main id="main" className="panel page" style={{ padding: "18px", marginTop: "16px" }}>
        <Outlet />
      </main>
      <SidekickDrawer />
    </div>
  );
}
