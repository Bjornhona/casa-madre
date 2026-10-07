/**
 * The hero's scrim stack — the single source of truth for the gradient layers
 * that sit between the hero imagery and the overlaid type.
 *
 * Extracted from HeroBackground so the coming-soon holding page renders the
 * *same* layers rather than a hand-matched copy. These gradient values must
 * exist in exactly one place: if you find yourself writing `deep/25` or a
 * `radial-gradient(... var(--color-deep) ...)` anywhere else, render this
 * instead.
 */

/**
 * `warm` = warm-dark wash + soft centre weight, for light type (cream / ivory /
 * sand) over bright footage.
 * `light` = soft cream glow behind the centred content, for dark type over
 * darker, more cinematic footage.
 */
export type ScrimVariant = "warm" | "light";

type HeroScrimProps = {
  scrim?: ScrimVariant;
  /**
   * Extra uniform `deep` wash, 0–100, laid over the variant above.
   *
   * 0 (the hero) keeps the photograph forward: atmosphere first, and the type
   * is decorative enough that ~2.3:1 against the poster's brightest band is an
   * accepted trade. Pages whose *content* is the point — the holding page —
   * raise this until the measured ratio clears AA. See the contrast notes in
   * ComingSoon for the measured numbers.
   */
  boost?: number;
};

export function HeroScrim({ scrim = "warm", boost = 0 }: HeroScrimProps) {
  return (
    <>
      {/* Linear framing — subtle at the head, deeper at the foot. Always on. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-deep/15 via-transparent to-deep/40" />

      {/* Content scrim. Mutually exclusive: `warm` darkens behind the centred
          content for light text over bright footage; `light` lifts it for dark
          text over darker footage. */}
      {scrim === "warm" ? (
        <>
          {/* Uniform wash — lifts contrast everywhere without a vignette edge. */}
          <div className="pointer-events-none absolute inset-0 bg-deep/25" />
          {/* Soft centre weight, aligned with the content block. */}
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 72% 62% at 50% 46%, color-mix(in srgb, var(--color-deep) 30%, transparent), transparent 78%)",
            }}
          />
        </>
      ) : (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 62% 54% at 50% 46%, color-mix(in srgb, var(--color-cream) 60%, transparent), transparent 72%)",
          }}
        />
      )}

      {/* Legibility boost. Inline color-mix rather than a `bg-deep/{n}` class so
          the amount stays a prop Tailwind doesn't have to see at build time. */}
      {boost > 0 && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundColor: `color-mix(in srgb, var(--color-deep) ${boost}%, transparent)`,
          }}
        />
      )}

      {/* Foot gradient over the scrim so the scroll chevron stays readable. */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/30 via-transparent to-transparent" />
    </>
  );
}
