import {defineQuery} from 'next-sanity'

/**
 * Localized fields (`description`, `blurb`) are stored as internationalized
 * arrays keyed by locale. We resolve them in GROQ with a coalesce fallback to
 * Spanish (the primary language) so a missing EN value never renders blank.
 * Pass `$locale` ("es" | "en") from the request.
 */

export const PROPERTIES_QUERY = defineQuery(`
  *[_type == "property" && isPublic == true] | order(price desc) {
    _id,
    title,
    "slug": slug.current,
    operation,
    propertyType,
    "neighbourhood": neighbourhood->name,
    price,
    surface,
    bedrooms,
    bathrooms,
    "description": coalesce(
      description[language == $locale][0].value,
      description[language == "es"][0].value
    ),
    highlights,
    "image": gallery[0]
  }
`)

export const NEIGHBOURHOODS_QUERY = defineQuery(`
  *[_type == "neighbourhood"] | order(order asc) {
    _id,
    name,
    "slug": slug.current,
    "blurb": coalesce(
      blurb[language == $locale][0].value,
      blurb[language == "es"][0].value
    ),
    image
  }
`)

// Slugs of every neighbourhood — used by generateStaticParams and the sitemap.
export const NEIGHBOURHOOD_SLUGS_QUERY = defineQuery(`
  *[_type == "neighbourhood" && defined(slug.current)] {
    "slug": slug.current
  }
`)

// A single neighbourhood by slug, with locale-aware intro/blurb/highlights and
// the locale-specific Portable Text body (bodyEn / bodyEs, falling back to ES).
// An unknown slug resolves to null, which the page turns into a 404.
export const NEIGHBOURHOOD_BY_SLUG_QUERY = defineQuery(`
  *[_type == "neighbourhood" && slug.current == $slug][0] {
    _id,
    name,
    "slug": slug.current,
    "blurb": coalesce(
      blurb[language == $locale][0].value,
      blurb[language == "es"][0].value
    ),
    "intro": coalesce(
      intro[language == $locale][0].value,
      intro[language == "es"][0].value
    ),
    heroImage,
    image,
    gallery[]{ ... },
    "highlights": highlights[]{
      "label": coalesce(
        label[language == $locale][0].value,
        label[language == "es"][0].value
      ),
      "value": coalesce(
        value[language == $locale][0].value,
        value[language == "es"][0].value
      )
    },
    "body": select(
      $locale == "en" && defined(bodyEn) => bodyEn,
      bodyEs
    )
  }
`)

// Published client testimonials, newest first. The quote is an
// internationalized array, resolved with the same coalesce-to-Spanish fallback
// used for property/journal localized fields.
export const PUBLISHED_TESTIMONIALS_QUERY = defineQuery(`
  *[_type == "testimonial" && isPublished == true] | order(_createdAt desc) {
    _id,
    "quote": coalesce(
      quote[language == $locale][0].value,
      quote[language == "es"][0].value
    ),
    attribution
  }
`)

// Slugs of every public property — used by generateStaticParams for the
// individual property pages.
export const PROPERTY_SLUGS_QUERY = defineQuery(`
  *[_type == "property" && isPublic == true && defined(slug.current)] {
    "slug": slug.current
  }
`)

// A single public property by slug, with its full gallery and the locale-aware
// description. Filtering `isPublic == true` here means a non-public (or missing)
// slug resolves to null, which the page turns into a 404.
export const PROPERTY_BY_SLUG_QUERY = defineQuery(`
  *[_type == "property" && slug.current == $slug && isPublic == true][0] {
    _id,
    title,
    "slug": slug.current,
    price,
    operation,
    propertyType,
    "neighbourhood": neighbourhood->name,
    surface,
    bedrooms,
    bathrooms,
    "description": coalesce(
      description[language == $locale][0].value,
      description[language == "es"][0].value
    ),
    highlights,
    gallery[]{ ... },
    isPublic
  }
`)

/**
 * Journal — bilingual editorial articles. As with properties, the localized
 * fields (title, excerpt) resolve via a coalesce fallback to Spanish, and the
 * Portable Text body picks the locale-specific field (bodyEn / bodyEs) with a
 * fallback to Spanish so a missing translation never renders blank.
 */

// Published articles for the Journal index grid, newest first.
export const JOURNAL_POSTS_QUERY = defineQuery(`
  *[_type == "journalPost" && isPublished == true && defined(slug.current)]
    | order(publishedAt desc) {
    _id,
    "slug": slug.current,
    category,
    publishedAt,
    author,
    coverImage,
    "title": coalesce(
      title[language == $locale][0].value,
      title[language == "es"][0].value
    ),
    "excerpt": coalesce(
      excerpt[language == $locale][0].value,
      excerpt[language == "es"][0].value
    )
  }
`)

// A few recent articles for the home-page Journal teaser.
export const RECENT_JOURNAL_POSTS_QUERY = defineQuery(`
  *[_type == "journalPost" && isPublished == true && defined(slug.current)]
    | order(publishedAt desc)[0...3] {
    _id,
    "slug": slug.current,
    category,
    publishedAt,
    coverImage,
    "title": coalesce(
      title[language == $locale][0].value,
      title[language == "es"][0].value
    ),
    "excerpt": coalesce(
      excerpt[language == $locale][0].value,
      excerpt[language == "es"][0].value
    )
  }
`)

// Slugs of every published article — used by generateStaticParams and sitemap.
export const JOURNAL_SLUGS_QUERY = defineQuery(`
  *[_type == "journalPost" && isPublished == true && defined(slug.current)] {
    "slug": slug.current
  }
`)

// A single published article by slug, with the locale-aware Portable Text body.
// Filtering isPublished here means an unpublished/missing slug resolves to null,
// which the page turns into a 404.
export const JOURNAL_POST_BY_SLUG_QUERY = defineQuery(`
  *[_type == "journalPost" && slug.current == $slug && isPublished == true][0] {
    _id,
    "slug": slug.current,
    category,
    publishedAt,
    author,
    coverImage,
    "title": coalesce(
      title[language == $locale][0].value,
      title[language == "es"][0].value
    ),
    "excerpt": coalesce(
      excerpt[language == $locale][0].value,
      excerpt[language == "es"][0].value
    ),
    "body": select(
      $locale == "en" && defined(bodyEn) => bodyEn,
      bodyEs
    ),
    isPublished
  }
`)
