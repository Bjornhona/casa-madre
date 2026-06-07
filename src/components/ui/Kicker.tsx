import { cn } from "@/lib/cn";

type KickerTone = "brown" | "sand" | "cream";

type KickerProps = React.PropsWithChildren<{
  className?: string;
  id?: string;
  /** Colour tone — `brown` on light backgrounds (default), `sand`/`cream` on the dark band. */
  tone?: KickerTone;
}>;

const TONE: Record<KickerTone, string> = {
  brown: "text-brown",
  sand: "text-sand",
  cream: "text-cream",
};

/** Uppercase, wide-tracked label — the editorial section marker. */
export function Kicker({ children, className, id, tone = "brown" }: KickerProps) {
  return (
    <p
      id={id}
      className={cn(
        "text-[12px] font-medium uppercase tracking-[0.22em]",
        TONE[tone],
        className,
      )}
    >
      {children}
    </p>
  );
}
