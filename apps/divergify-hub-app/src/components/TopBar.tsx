import { useApp } from "../state/useApp";
import { mapOverwhelmToSupportLevel, useSessionState } from "../state/sessionState";
import { TakotaStatus } from "./TakotaStatus";

type Props = {
  onOpenState?: () => void;
};

export function TopBar({ onOpenState }: Props) {
  const { data, actions } = useApp();
  const { session } = useSessionState();

  const support = session ? mapOverwhelmToSupportLevel(session.overwhelm) : null;
  const supportLabel =
    support === "overloaded" ? "High support" : support === "gentle" ? "Gentle support" : "Baseline";
  const stateLabel = session ? `State: ${supportLabel}` : "Set state";

  return (
    <div className="panel" style={{ padding: "14px 16px", marginBottom: "16px" }}>
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
        <div className="stack" style={{ gap: "2px" }}>
          <div style={{ fontWeight: 800, letterSpacing: "-0.01em" }}>Divergify</div>
          <div className="mini">Bridge mode: on.</div>
        </div>

        <div className="stack" style={{ alignItems: "flex-end", gap: "10px" }}>
          <TakotaStatus />
          <div className="row" style={{ flexWrap: "wrap" }}>
            <button className="btn" onClick={onOpenState}>
              {stateLabel}
            </button>
            <button className="btn" onClick={actions.toggleShades} aria-pressed={data.preferences.shades}>
              Shades: {data.preferences.shades ? "ON" : "OFF"}
            </button>
            <button className="btn" onClick={actions.toggleTinFoil} aria-pressed={data.preferences.tinFoil}>
              Tin Foil: {data.preferences.tinFoil ? "ON" : "OFF"}
            </button>
          </div>
        </div>
      </div>

      {data.preferences.tinFoil ? (
        <div className="notice privacy" style={{ marginTop: "12px" }}>
          Tin Foil Hat is on. This disables integrations and hides embed-style content. It does not claim network-level blocking.
        </div>
      ) : null}
    </div>
  );
}
