import { useApp } from "../state/useApp";
import { getSidekick } from "../sidekicks/defs";
import { TakotaAvatar } from "./TakotaAvatar";

export function TakotaStatus() {
  const { data } = useApp();
  const tinFoilHat = data.preferences.tinFoil;
  const lowStim = data.preferences.lowStim;
  const sidekick = getSidekick(data.activeSidekickId);

  const label = tinFoilHat ? "Privacy Mode" : `${sidekick.name} active`;
  const line = tinFoilHat ? "Local-only guidance." : sidekick.tagline;

  return (
    <div className="takota-status" data-low-stim={lowStim ? "true" : "false"}>
      <div className="takota-status-copy">
        <div className="takota-status-label">{label}</div>
        <div className="takota-status-line">{line}</div>
      </div>
      <TakotaAvatar className="takota-status-avatar" showFoilRing={tinFoilHat} />
    </div>
  );
}
