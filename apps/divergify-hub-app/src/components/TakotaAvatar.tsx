type TakotaAvatarProps = {
  className?: string;
  showFoilRing?: boolean;
  // Backward-compatible props for existing call sites.
  mode?: "default" | "shades";
  privacy?: "off" | "tinfoil";
};

export function TakotaAvatar(props: TakotaAvatarProps) {
  const { className, showFoilRing, privacy } = props;
  const foil = showFoilRing ?? privacy === "tinfoil";

  return (
    <svg viewBox="0 0 100 100" className={className} aria-label="Takota North Star" role="img">
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round">
        <path d="M50 6 L58 38 L94 50 L58 62 L50 94 L42 62 L6 50 L42 38 Z" />
      </g>
      <circle cx="50" cy="50" r="6" fill="currentColor" />
      <circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        strokeDasharray="7 7"
        opacity={foil ? 0.9 : 0}
      />
    </svg>
  );
}
