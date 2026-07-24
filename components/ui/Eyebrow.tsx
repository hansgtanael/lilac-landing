/** Signature eyebrow — 11px DM Sans Medium, uppercase, 35% tracking. Deep
 *  lilac by default (WCAG-safe on the cream canvas); pass `text-brand` via
 *  className when it sits over dark photography. */
export default function Eyebrow({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-[11px] font-medium uppercase tracking-[0.35em] text-brand-deep ${className}`}
    >
      {children}
    </p>
  );
}
