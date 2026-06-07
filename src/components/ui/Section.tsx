import { cn } from "@/lib/cn";

type SectionProps = React.PropsWithChildren<{
  id?: string;
  className?: string;
  containerClassName?: string;
  "aria-labelledby"?: string;
}>;

/**
 * Standard section wrapper: responsive horizontal gutters, generous vertical
 * rhythm (~92px desktop, per the brief) and a centred max-width container.
 */
export function Section({
  id,
  className,
  containerClassName,
  children,
  ...rest
}: SectionProps) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-24 px-6 py-20 sm:px-10 lg:px-12 lg:py-[5.75rem]",
        className,
      )}
      {...rest}
    >
      <div className={cn("mx-auto w-full max-w-[1240px]", containerClassName)}>
        {children}
      </div>
    </section>
  );
}
