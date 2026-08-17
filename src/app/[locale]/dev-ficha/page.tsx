import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { client } from "@/sanity/lib/client";
import { sanityFetch } from "@/sanity/lib/live";
import { FICHA_QUERY } from "@/sanity/ficha/query";
import type { FichaLocale } from "@/sanity/ficha/copy";
import { FichaPreview } from "./FichaPreview";

/**
 * TEMPORARY dev-only preview for the ficha component. 404s outside development.
 * Delete once the Studio document action exists.
 *
 *   /es/dev-ficha            → first property in the dataset
 *   /es/dev-ficha?id=<_id>   → a specific one
 *   /en/dev-ficha            → the English ficha
 */
export default async function DevFichaPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ id?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { locale } = await params;
  const { id } = await searchParams;
  setRequestLocale(locale);

  const propertyId =
    id ?? (await client.fetch<string | null>(`*[_type == "property"][0]._id`));
  if (!propertyId) notFound();

  const { data } = await sanityFetch({
    query: FICHA_QUERY,
    params: { id: propertyId, locale },
  });
  if (!data.property) notFound();

  return (
    <FichaPreview
      property={data.property}
      registration={data.registration}
      locale={locale as FichaLocale}
      recipientName="Sr. y Sra. Ejemplo"
    />
  );
}
