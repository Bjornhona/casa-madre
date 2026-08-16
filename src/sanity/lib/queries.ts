import {defineQuery} from 'next-sanity'

/**
 * Localized fields (`description`, `blurb`) are stored as internationalized
 * arrays keyed by locale. We resolve them in GROQ with a coalesce fallback to
 * Spanish (the primary language) so a missing EN value never renders blank.
 * Pass `$locale` ("es" | "en") from the request.
 */

/**
 * Available properties first, closed ones last, keeping the price ordering
 * within each group — a buyer scrolling a price-ordered list shouldn't hit
 * dead listings at random. `order()` runs on the document before the
 * projection, so nulling `price` below for hidden prices does not disturb
 * the sort. A missing `status` (legacy documents) falls through to 0 and is
 * treated as available.
 *
 * `ocultarPrecio` is honoured in GROQ rather than at render time: these
 * results are serialized into the client payload, so a price merely left
 * unrendered would still be readable in view-source.
 */
export const PROPERTIES_QUERY = defineQuery(`
  *[_type == "property" && isPublic == true]
    | order(select(
        status == "vendido" => 2,
        status == "reservado" => 1,
        0
      ) asc, price desc) {
    _id,
    "title": coalesce(
      title[language == $locale][0].value,
      title[language == "es"][0].value
    ),
    "slug": slug.current,
    operation,
    propertyType,
    status,
    ocultarPrecio,
    "neighbourhood": neighbourhood->name,
    "price": select(ocultarPrecio == true => null, price),
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

// Team members for the contact page's personal agent cards, in the order the
// client sets in the Studio. The localized job title resolves with the same
// coalesce-to-Spanish fallback used everywhere else.
export const AGENTS_QUERY = defineQuery(`
  *[_type == "agent"] | order(order asc) {
    _id,
    name,
    "title": coalesce(
      title[language == $locale][0].value,
      title[language == "es"][0].value
    ),
    email,
    phone,
    photo,
    aicat
  }
`)

// AICAT registrations for the aviso legal. These are individual registrations —
// there is no company-level number — so the page lists whichever agents have
// one. Filtered in GROQ so the page never has to render a bare label.
export const AGENT_AICATS_QUERY = defineQuery(`
  *[_type == "agent" && defined(aicat) && aicat != ""] | order(order asc) {
    _id,
    name,
    aicat
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
// individual property pages. Deliberately not filtered by `status`: a sold or
// reserved property keeps its page and its sitemap entry, which is the whole
// point of leaving it visible as a track record.
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
    "title": coalesce(
      title[language == $locale][0].value,
      title[language == "es"][0].value
    ),
    "slug": slug.current,
    "price": select(ocultarPrecio == true => null, price),
    operation,
    propertyType,
    status,
    ocultarPrecio,
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
    ),
    "videoDuration": video.duration,
    "videoPublicId": video.publicId
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
    ),
    "videoDuration": video.duration,
    "videoPublicId": video.publicId
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
    video,
    "videoCaption": coalesce(
      videoCaption[language == $locale][0].value,
      videoCaption[language == "es"][0].value
    ),
    "body": select(
      $locale == "en" && defined(bodyEn) => bodyEn,
      bodyEs
    ),
    isPublished
  }
`)
