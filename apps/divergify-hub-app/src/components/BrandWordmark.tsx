type BrandWordmarkProps = {
  className?: string;
  alt?: string;
};

const WORDMARK_SRC = `${import.meta.env.BASE_URL}brand-wordmark-clean.png`;

export function BrandWordmark({ className, alt = "Divergify" }: BrandWordmarkProps) {
  const classes = ["brand-wordmark", className].filter(Boolean).join(" ");
  return <img src={WORDMARK_SRC} alt={alt} className={classes} decoding="async" />;
}
