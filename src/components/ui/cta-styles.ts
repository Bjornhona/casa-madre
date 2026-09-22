import { cn } from "@/lib/cn";

/** `onLight` = brown outline for ivory backgrounds; `onDark` = cream outline over imagery. */
export type CTAVariant = "onLight" | "onDark";

const BASE =
  "inline-block border px-7 py-3.5 text-[11px] uppercase tracking-[0.16em] transition-colors duration-500 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";

const VARIANT: Record<CTAVariant, string> = {
  onLight:
    "border-brown text-brown hover:bg-brown hover:text-cream focus-visible:ring-brown focus-visible:ring-offset-ivory",
  onDark:
    "border-cream/70 text-cream hover:bg-cream hover:text-deep focus-visible:ring-cream focus-visible:ring-offset-transparent",
};

/**
 * The one outlined-CTA treatment, as a class string.
 *
 * CTALink and CTAButton are the components to reach for. This exists for the
 * cases that need the same look on an element neither primitive covers — a
 * <button type="submit">, or an <a> carrying mailto/target that CTALink's
 * href-only API doesn't expose — so the treatment is defined once.
 */
export function ctaClass(variant: CTAVariant = "onLight", className?: string) {
  return cn(BASE, VARIANT[variant], className);
}
