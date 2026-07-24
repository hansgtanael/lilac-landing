/** Double-bezel card — outer shell white/5 + 1px light-faded ring + 4px inset,
 *  inner core blue-deep at radius/main. Used for gallery tiles, bedroom cards,
 *  the stats panel, the booking card, and confirmation states. */
export default function Bezel({
  children,
  className = "",
  innerClassName = "",
}: {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={`rounded-[calc(var(--radius--main)+0.25rem)] bg-white/5 p-1 ring-1 ring-light-faded ${className}`}
    >
      <div
        className={`h-full overflow-hidden rounded-main bg-blue-deep shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] ${innerClassName}`}
      >
        {children}
      </div>
    </div>
  );
}
