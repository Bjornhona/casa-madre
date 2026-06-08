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
