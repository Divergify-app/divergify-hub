
export function TakotaAvatar(props: { mode: "default" | "shades"; privacy: "off" | "tinfoil" }) {
  const { mode, privacy } = props;

  // Pure CSS avatar: no external assets.
  const glasses = mode === "shades";
  const foil = privacy === "tinfoil";

  return (
    <div
      aria-hidden="true"
      style={{
        width: 28,
        height: 28,
        borderRadius: 999,
        border: "1px solid var(--border-strong)",
        background: "rgba(255,255,255,0.06)",
        display: "grid",
        placeItems: "center",
        position: "relative",
        overflow: "visible"
      }}
    >
      {foil ? (
        <div
          style={{
            position: "absolute",
            top: -10,
            width: 0,
            height: 0,
            borderLeft: "8px solid transparent",
            borderRight: "8px solid transparent",
            borderBottom: "12px solid rgba(255,255,255,0.55)"
          }}
        />
      ) : null}

      <div style={{ display: "flex", gap: 4 }}>
        <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--text)" }} />
        <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--text)" }} />
      </div>

      {glasses ? (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 5,
            right: 5,
            height: 10,
            borderRadius: 6,
            border: "1px solid rgba(255,255,255,0.55)",
            background: "rgba(0,0,0,0.22)"
          }}
        />
      ) : null}
    </div>
  );
}
