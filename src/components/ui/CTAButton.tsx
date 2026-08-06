import { cn } from "@/lib/cn";

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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-block border border-brown px-7 py-3.5 text-[11px] uppercase tracking-[0.16em] text-brown transition-colors duration-500 ease-out hover:bg-brown hover:text-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory",
        className,
      )}
    >
      {children}
    </button>
  );
}
