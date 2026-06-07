import { cn } from "@/lib/cn";

type CTALinkProps = React.PropsWithChildren<{
  href: string;
  /** `onLight` = brown outline for ivory backgrounds; `onDark` = cream outline over imagery. */
  variant?: "onLight" | "onDark";
  className?: string;
}>;

/** Outlined, uppercase, wide-tracked call to action. Slow colour transition only. */
export function CTALink({
  href,
  variant = "onLight",
  className,
  children,
}: CTALinkProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-block border px-7 py-3.5 text-[11px] uppercase tracking-[0.16em] transition-colors duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        variant === "onLight"
          ? "border-brown text-brown hover:bg-brown hover:text-cream focus-visible:ring-brown focus-visible:ring-offset-ivory"
          : "border-cream/70 text-cream hover:bg-cream hover:text-deep focus-visible:ring-cream focus-visible:ring-offset-transparent",
        className,
      )}
    >
      {children}
    </a>
  );
}
