import heroPoster from "../../public/mediterranean-seaview.webp";

/**
 * The single source of truth for the hero background, shared by the homepage
 * Hero and the coming-soon holding page so the two never drift apart.
 *
 * Statically imported rather than referenced by path: Next then knows the
 * intrinsic dimensions and generates a `blurDataURL`, which is what the
 * holding page uses as its `placeholder="blur"`. The asset itself is not
 * duplicated — this is the same file both pages already served.
 *
 * `.src` is the public URL (`/mediterranean-seaview.webp`) for the places that
 * need a plain string, e.g. HeroBackground's raw <img> LCP element.
 */
export { heroPoster };

export const HERO_VIDEO_MP4 = "/hero/hero.mp4";
