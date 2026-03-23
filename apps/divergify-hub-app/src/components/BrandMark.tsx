type BrandMarkProps = {
  className?: string;
};

const ICON_SRC = `${import.meta.env.BASE_URL}brand-north-star.png`;

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <img
      src={ICON_SRC}
      alt=""
      className={className}
      aria-hidden="true"
      decoding="async"
    />
  );
}
