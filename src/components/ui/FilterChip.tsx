import { cn } from "@/lib/cn";

type FilterChipProps = React.PropsWithChildren<{
  selected: boolean;
  onClick: () => void;
  className?: string;
}>;

/**
 * Outlined toggle in the CTALink type scale, at a smaller weight — the unit of
 * the Journal filter row. Deliberately a plain <button> with aria-pressed
 * rather than a custom radio; see JournalFilters for the reasoning.
 */
export function FilterChip({
  selected,
  onClick,
  className,
  children,
}: FilterChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-block border px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory",
        selected
          ? "border-brown bg-brown text-cream"
          : "border-brown/25 text-brown hover:border-brown",
        className,
      )}
    >
      {children}
    </button>
  );
}
