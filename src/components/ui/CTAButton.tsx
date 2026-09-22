import { ctaClass } from "./cta-styles";

type CTAButtonProps = React.PropsWithChildren<{
  onClick: () => void;
  className?: string;
}>;

/**
 * CTALink's treatment on a real <button>, for actions that change state on the
 * page rather than navigate ("Ver más", "Ver todos los artículos"). Kept
 * separate rather than adding an `as` prop to CTALink so that primitive stays
 * a link and its callers are untouched.
 */
export function CTAButton({ onClick, className, children }: CTAButtonProps) {
  return (
    <button type="button" onClick={onClick} className={ctaClass("onLight", className)}>
      {children}
    </button>
  );
}
