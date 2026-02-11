import { useEffect, useMemo, useState } from "react";
import { mapOverwhelmToSupportLevel, useSessionState } from "../state/sessionState";
import { useApp } from "../state/useApp";
import { getSidekick } from "../sidekicks/defs";

type Props = {
  open: boolean;
  onClose?: () => void;
};

export function TakotaCheckIn({ open, onClose }: Props) {
  const { setOverwhelm, skipCheckIn, session } = useSessionState();
  const { data } = useApp();
  const sidekick = getSidekick(data.activeSidekickId);
  const [value, setValue] = useState(() => session?.overwhelm ?? 50);

  useEffect(() => {
    if (!open) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setValue(session?.overwhelm ?? 50);
  }, [open, session?.overwhelm]);

  const titleId = useMemo(() => "takota-checkin-title", []);
  const descId = useMemo(() => "takota-checkin-desc", []);

  const level = mapOverwhelmToSupportLevel(value);
  const levelLabel =
    level === "overloaded"
      ? "High support"
      : level === "gentle"
      ? "Gentle support"
      : "Baseline";

  if (!open) return null;

  return (
    <div className="checkin-backdrop">
      <div
        className="panel checkin-panel"
        role="dialog"
        aria-labelledby={titleId}
        aria-describedby={descId}
      >
        <div className="stack" style={{ gap: 8 }}>
          <h2 id={titleId} style={{ margin: 0 }}>
            {sidekick.checkInTitle}
          </h2>
          <p id={descId} className="p">
            Set your stimulation level. <br />
            {sidekick.checkInHint}
          </p>

          <div className="checkin-slider">
            <label className="label" htmlFor="takota-overwhelm">
              Stimulation level
            </label>
            <input
              id="takota-overwhelm"
              className="checkin-range"
              type="range"
              min={0}
              max={100}
              step={1}
              list="takota-overwhelm-anchors"
              value={value}
              aria-valuetext={`${value} out of 100`}
              onChange={(event) => setValue(Number(event.target.value))}
            />
            <datalist id="takota-overwhelm-anchors">
              <option value="0" label="Calm" />
              <option value="50" label="Stretched" />
              <option value="100" label="Overloaded" />
            </datalist>

            <div className="checkin-anchors">
              <span>0 calm</span>
              <span>50 stretched</span>
              <span>100 overloaded</span>
            </div>

            <div className="checkin-level">
              <span className="badge">{levelLabel}</span>
              <label className="mini" htmlFor="takota-overwhelm-input">
                Value
              </label>
              <input
                id="takota-overwhelm-input"
                className="checkin-input"
                type="number"
                min={0}
                max={100}
                step={1}
                value={value}
                onChange={(event) => setValue(Number(event.target.value))}
              />
            </div>
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
            <button
              className="btn primary"
              onClick={() => {
                setOverwhelm(value);
                onClose?.();
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
