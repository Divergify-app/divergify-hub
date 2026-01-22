import { useEffect, useMemo } from "react";
import { useSessionState } from "../state/sessionState";

type Props = {
  open: boolean;
  onClose?: () => void;
};

const choices = [
  { id: "overloaded", label: "Overloaded", hint: "We go quieter first. One step." },
  { id: "neutral", label: "Stable", hint: "Baseline mode. Keep it clean." },
  { id: "ready", label: "Ready", hint: "Let’s move. You can add scaffolds." }
] as const;

export function TakotaCheckIn({ open, onClose }: Props) {
  const { setMode, skipCheckIn } = useSessionState();

  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [open]);

  const titleId = useMemo(() => `takota-checkin-title`, []);
  const descId = useMemo(() => `takota-checkin-desc`, []);

  if (!open) return null;

  return (
    <div className="checkin-backdrop" role="dialog" aria-modal="true" aria-labelledby={titleId} aria-describedby={descId}>
      <div className="checkin-panel panel">
        <div className="stack" style={{ gap: 8 }}>
          <div className="badge">Takota check-in</div>
          <h2 className="h2" id={titleId}>Where are we at?</h2>
          <p className="p" id={descId}>Pick a mode. I’ll adapt.</p>
        </div>

        <div className="checkin-grid">
          {choices.map((choice) => (
            <button
              key={choice.id}
              className="checkin-choice"
              onClick={() => {
                setMode(choice.id);
                onClose?.();
              }}
            >
              <span className="checkin-choice-title">{choice.label}</span>
              <span className="checkin-choice-hint">{choice.hint}</span>
            </button>
          ))}
        </div>

        <div className="checkin-footer">
          <button
            className="btn ghost"
            onClick={() => {
              skipCheckIn();
              onClose?.();
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
