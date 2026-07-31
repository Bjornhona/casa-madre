import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteNav } from "@/components/SiteNav";
import { Footer } from "@/components/Footer";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { JournalArticle } from "@/components/JournalArticle";
import { sanityFetch } from "@/sanity/lib/live";
import { client } from "@/sanity/lib/client";
import {
  JOURNAL_POST_BY_SLUG_QUERY,
  JOURNAL_SLUGS_QUERY,
} from "@/sanity/lib/queries";
import { urlFor } from "@/sanity/lib/image";
import { ogPosterUrl } from "@/lib/cloudinary";
import type { JOURNAL_POST_BY_SLUG_QUERY_RESULT } from "@/sanity/types.gen";
import { routing } from "@/i18n/routing";

type Params = { locale: string; slug: string };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

// BCP-47 mapping for the Article `inLanguage` field.
const BCP47: Record<string, string> = { es: "es-ES", en: "en-GB" };

/**
 * The 1200×630 share image: cover image → a frame from the video itself.
 * Video-led articles often carry no cover image, and without the fallback
 * they'd be shared with no image at all.
 *
 * The cover image crops, which is safe because the field has hotspot enabled so
 * the editor's focal point survives. The Cloudinary frame has no hotspot to go
 * by and is vertical, so it pads onto the brand background instead — cropping a
 * talking head to a landscape card decapitates it.
 */
function articleImage(
  post: NonNullable<JOURNAL_POST_BY_SLUG_QUERY_RESULT>,
): string | undefined {
  if (post.coverImage?.asset) {
    return urlFor(post.coverImage).width(1200).height(630).fit("crop").url();
  }
  if (post.video?.publicId) {
    return ogPosterUrl(post.video.publicId);
  }
  return undefined;
}

// Pre-render every published article in both locales. `generateStaticParams`
// runs without a request, so we use the plain client (not `sanityFetch`, which
// reads `draftMode()` and is only valid during request rendering).
export async function generateStaticParams() {
  const data = await client
    .withConfig({ perspective: "published", useCdn: false })
    .fetch(JOURNAL_SLUGS_QUERY);
  return routing.locales.flatMap((locale) =>
    (data ?? []).map(({ slug }) => ({ slug, locale })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const { data: post } = await sanityFetch({
    query: JOURNAL_POST_BY_SLUG_QUERY,
    params: { slug, locale },
    stega: false,
  });

  if (!post) return {};

  const description = post.excerpt
    ? post.excerpt.length > 160
      ? `${post.excerpt.slice(0, 157).trimEnd()}…`
      : post.excerpt
    : undefined;

  const ogImage = articleImage(post);

  const fullTitle = `${post.title} — Casa Madre`;
  const url = `/${locale}/journal/${slug}`;

  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: url,
      languages: {
        es: `/es/journal/${slug}`,
        en: `/en/journal/${slug}`,
        "x-default": `/es/journal/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: fullTitle,
      description,
      url,
      ...(post.publishedAt ? { publishedTime: post.publishedAt } : {}),
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const { data: post } = await sanityFetch({
    query: JOURNAL_POST_BY_SLUG_QUERY,
    params: { slug, locale },
  });

  if (!post) notFound();

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const breadcrumbs =
    SITE_URL && post.title
      ? [
          { name: "Casa Madre", url: `${SITE_URL}/${locale}` },
          { name: tNav("items.journal.label"), url: `${SITE_URL}/${locale}/journal` },
          { name: post.title, url: `${SITE_URL}/${locale}/journal/${slug}` },
        ]
      : [];

  const image = articleImage(post);

  // Article structured data. Brand-controlled fields only — safe to inline.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    ...(image ? { image: [image] } : {}),
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    author: { "@type": "Organization", name: post.author || "Casa Madre" },
    publisher: { "@type": "Organization", name: "Casa Madre" },
    inLanguage: BCP47[locale] ?? "es-ES",
    ...(SITE_URL ? { url: `${SITE_URL}/${locale}/journal/${slug}` } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbJsonLd items={breadcrumbs} />
      <SiteNav />
      <main>
        <JournalArticle post={post} />
      </main>
      <Footer />
    </>
  );
}
