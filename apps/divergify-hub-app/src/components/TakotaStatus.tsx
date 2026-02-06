import { useApp } from "../state/useApp";
import { TakotaAvatar } from "./TakotaAvatar";

export function TakotaStatus() {
  const { data } = useApp();
  const tinFoilHat = data.preferences.tinFoil;
  const lowStim = data.preferences.lowStim;

  return (
    <div className="takota-status" data-low-stim={lowStim ? "true" : "false"}>
      <div className="takota-status-copy">
        <div className="takota-status-label">{tinFoilHat ? "Privacy Mode" : "Guide Active"}</div>
        <div className="takota-status-line">{tinFoilHat ? "External AI disabled." : "Ready when you are."}</div>
      </div>
      <TakotaAvatar className="takota-status-avatar" showFoilRing={tinFoilHat} />
    </div>
  );
}
