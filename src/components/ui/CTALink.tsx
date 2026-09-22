import { ctaClass, type CTAVariant } from "./cta-styles";

type CTALinkProps = React.PropsWithChildren<{
  href: string;
  /** `onLight` = brown outline for ivory backgrounds; `onDark` = cream outline over imagery. */
  variant?: CTAVariant;
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
    <a href={href} className={ctaClass(variant, className)}>
      {children}
    </a>
  );
}
