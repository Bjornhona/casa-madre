import { cn } from "@/lib/cn";

/**
 * Status label laid over a property image (Reservado / Vendido / Alquilado).
 *
 * Same geometry as the neighbourhood pill on the property card, with the fill
 * inverted so the two read as different kinds of information — one says where,
 * one says what state. Purely presentational: the caller derives the label
 * (see `statusLabelKey`) and positions it.
 */
export function StatusBadge({
  className,
  children,
}: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={cn(
        "rounded-card bg-deep/75 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-cream backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </span>
  );
}
