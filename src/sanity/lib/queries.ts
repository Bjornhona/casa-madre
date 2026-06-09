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
