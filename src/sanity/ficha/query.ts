import { defineQuery } from "next-sanity";

/**
 * Everything one ficha needs, in a single round trip.
 *
 * Draft-aware: the ficha is generated from the Studio, where the editor is
 * looking at the draft, so an unpublished edit must appear on the PDF.
 * `_id in [$id, "drafts." + $id]` matches whichever exists (and still matches
 * when `$id` is itself a draft id); ordering by `_updatedAt` picks the draft
 * when both do, since a draft is by definition never older than its published
 * version. The `_type` guard is not redundant: without it an id-only filter
 * could match any document, and TypeGen widens the result to a union of every
 * document type with all fields nulled.
 *
 * `registration` is the first agent holding an AICAT number, not the property's
 * assigned `agent`. The footer line is a registration disclosure — any
 * registered agent of the firm satisfies it — while the contact block is a
 * separate concern with a separate source. Both agents are individually
 * registered; there is no company-level number.
 *
 * Unlike PROPERTY_BY_SLUG_QUERY, `price` is returned raw rather than nulled on
 * `ocultarPrecio`: that guard exists because page results are serialized into
 * the browser payload, whereas a ficha is rendered for a named recipient and
 * the price is the point. The caller decides what to print.
 */
export const FICHA_QUERY = defineQuery(`{
  "property": *[_type == "property" && _id in [$id, "drafts." + $id]]
    | order(_updatedAt desc)[0] {
    _id,
    "title": coalesce(
      title[language == $locale][0].value,
      title[language == "es"][0].value
    ),
    "slug": slug.current,
    operation,
    propertyType,
    status,
    price,
    ocultarPrecio,
    "neighbourhood": neighbourhood->{
      _id,
      name,
      "slug": slug.current
    },
    surface,
    surfaceUtil,
    bedrooms,
    bathrooms,
    energyRating,
    energyCertNumber,
    referenciaCatastral,
    cedulaHabitabilidad,
    "description": coalesce(
      description[language == $locale][0].value,
      description[language == "es"][0].value
    ),
    highlights,
    gallery[]{ ... }
  },
  "registration": *[_type == "agent" && defined(aicat) && aicat != ""]
    | order(order asc)[0] {
    name,
    aicat
  }
}`);
