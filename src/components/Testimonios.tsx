import { getLocale } from "next-intl/server";
import { sanityFetch } from "@/sanity/lib/live";
import { PUBLISHED_TESTIMONIALS_QUERY } from "@/sanity/lib/queries";
import { TestimoniosView } from "@/components/TestimoniosView";

/**
 * Testimonials band, driven by the Sanity `testimonial` schema. Fetches the
 * published quotes for the active locale and hands them to the presentational
 * client view. Renders nothing when there are no published testimonials, so the
 * page never shows an empty band.
 *
 * `max` curates how many to show (the home page shows the 3 most recent).
 */
export async function Testimonios({ max }: { max?: number }) {
  const locale = await getLocale();
  const { data: testimonials } = await sanityFetch({
    query: PUBLISHED_TESTIMONIALS_QUERY,
    params: { locale },
  });

  if (!testimonials || testimonials.length === 0) return null;

  const shown = max ? testimonials.slice(0, max) : testimonials;

  return <TestimoniosView testimonials={shown} />;
}
