import { cn } from "@/lib/cn";

type KickerProps = React.PropsWithChildren<{
  className?: string;
  id?: string;
}>;

/** Uppercase, wide-tracked label in brown — the editorial section marker. */
export function Kicker({ children, className, id }: KickerProps) {
  return (
    <p
      id={id}
      className={cn(
        "text-[12px] font-medium uppercase tracking-[0.22em] text-brown",
        className,
      )}
    >
      {children}
    </p>
  );
}
