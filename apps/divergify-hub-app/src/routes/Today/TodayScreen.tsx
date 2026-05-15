import type { CSSProperties } from "react";
import { colors, motion, radii, spacing, typography } from "../../design/tokens";

export interface TodayScreenProps {
  capacityPercent: number;
}

export function TodayScreen({ capacityPercent }: TodayScreenProps) {
  const clamped = Math.max(0, Math.min(100, capacityPercent));
  const display = Math.round(clamped);

  const tone =
    clamped >= 80 ? colors.status.danger :
    clamped >= 60 ? colors.status.warning :
    colors.status.success;

  const container: CSSProperties = {
    padding: spacing.xl,
    color: colors.text.primary,
    fontFamily: typography.family.sans,
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  };

  const heading: CSSProperties = {
    fontSize: typography.size.xl,
    lineHeight: typography.lineHeight.tight,
    fontWeight: typography.weight.bold,
    margin: 0,
  };

  const meterRow: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    fontSize: typography.size.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  };

  const track: CSSProperties = {
    height: spacing.md,
    borderRadius: radii.pill,
    background: colors.bg.overlay,
    border: `1px solid ${colors.border.base}`,
    overflow: "hidden",
  };

  const fill: CSSProperties = {
    height: "100%",
    width: `${clamped}%`,
    background: tone,
    borderRadius: radii.pill,
    transition:
      `width ${motion.duration.base}ms ${motion.easing.standard}, ` +
      `background-color ${motion.duration.base}ms ${motion.easing.standard}`,
  };

  return (
    <section style={container}>
      <h1 style={heading}>Today</h1>

      <div>
        <div style={meterRow}>
          <span>Capacity</span>
          <span aria-hidden="true">{display}%</span>
        </div>
        <div
          style={track}
          role="progressbar"
          aria-label="Current capacity"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={display}
        >
          <div style={fill} />
        </div>
      </div>
    </section>
  );
}
