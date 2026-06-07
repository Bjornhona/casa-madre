import { cn } from "@/lib/cn";

type SerifHeadingProps = React.PropsWithChildren<{
  as?: "h1" | "h2" | "h3" | "h4";
  className?: string;
  id?: string;
}>;

/** Cormorant Garamond display heading with the locked tight tracking. */
export function SerifHeading({
  as: Tag = "h2",
  className,
  id,
  children,
}: SerifHeadingProps) {
  return (
    <Tag
      id={id}
      className={cn("font-serif font-medium tracking-[-0.035em]", className)}
    >
      {children}
    </Tag>
  );
}
