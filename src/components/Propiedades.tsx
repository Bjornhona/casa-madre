"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { BedDouble, Bath, Maximize2 } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { CTALink } from "@/components/ui/CTALink";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { isClosed, statusLabelKey } from "@/lib/property-status";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { contactoHref } from "@/lib/contacto-href";
import { urlFor } from "@/sanity/lib/image";
import type { PROPERTIES_QUERY_RESULT } from "@/sanity/types.gen";

type Operation = "venta" | "alquiler";
type OperationFilter = Operation | "all";
type BedroomsFilter = number | "all";

const BEDROOM_OPTIONS: BedroomsFilter[] = ["all", 1, 2, 3, 4];

// Interior placeholders, used only until a property has its own gallery in
// Sanity (brief §9 allows interim imagery). Assigned by index for variety.
const FALLBACK_POOL = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=1000&q=85",
];

export function Propiedades({
  properties,
  variant = "page",
}: {
  properties: PROPERTIES_QUERY_RESULT;
  variant?: "home" | "page";
}) {
  const isHome = variant === "home";
  const t = useTranslations("propiedades");
  const tf = useTranslations("propiedades.filters");
  const tc = useTranslations("propiedades.card");
  const tp = useTranslations("propertyPage");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce);

  const zones = useMemo(
    () => Array.from(new Set(properties.map((p) => p.neighbourhood))),
    [properties],
  );
  // Properties with a hidden price come back with `price: null` from GROQ, so
  // they can't set the ceiling and can't be measured against the slider.
  const priceCeiling = useMemo(() => {
    const known = properties
      .map((p) => p.price)
      .filter((price): price is number => price != null);
    return known.length ? Math.max(...known) : 0;
  }, [properties]);

  // Stable _id → fallback image, by the property's position in the full set.
  const fallbackFor = useMemo(() => {
    const map = new Map<string, string>();
    properties.forEach((p, i) =>
      map.set(p._id, FALLBACK_POOL[i % FALLBACK_POOL.length]),
    );
    return map;
  }, [properties]);

  const [operation, setOperation] = useState<OperationFilter>("all");
  const [zone, setZone] = useState<string>("all");
  const [maxPrice, setMaxPrice] = useState<number>(priceCeiling);
  const [bedrooms, setBedrooms] = useState<BedroomsFilter>("all");

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    [locale],
  );

  const visible = properties.filter((p) => {
    if (operation !== "all" && p.operation !== operation) return false;
    if (zone !== "all" && p.neighbourhood !== zone) return false;
    // A hidden price can't be compared, so it never fails the price filter.
    if (p.price != null && p.price > maxPrice) return false;
    if (bedrooms !== "all") {
      const beds = p.bedrooms ?? 0;
      if (bedrooms === 4 ? beds < 4 : beds !== bedrooms) return false;
    }
    return true;
  });

  // The home teaser shows the first three properties without the filter bar.
  const displayed = isHome ? properties.slice(0, 3) : visible;

  const pillBase =
    "border px-4 py-2 text-[11px] uppercase tracking-[0.14em] transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brown focus-visible:ring-offset-ivory";
  const pillOn = "border-brown bg-brown text-cream";
  const pillOff = "border-line text-deep/70 hover:border-brown hover:text-brown";

  const operationOptions: { value: OperationFilter; label: string }[] = [
    { value: "all", label: tf("all") },
    { value: "venta", label: tf("sale") },
    { value: "alquiler", label: tf("rent") },
  ];

  return (
    <Section id="propiedades" aria-labelledby="propiedades-kicker" className="border-line border-b-1 bg-bone">
      <Kicker id="propiedades-kicker">{t("kicker")}</Kicker>
      <p className="mt-6 max-w-[46rem] font-serif text-[24px] leading-[1.2] text-deep sm:text-[29px]">
        {t("intro")}
      </p>

      {/* Filter bar — restrained pills + a thin price slider, not a portal UI. */}
      {!isHome && (
      <div className="mt-12 flex flex-col gap-8 border-y border-line py-8 lg:flex-row lg:flex-wrap lg:items-end lg:gap-x-14 lg:gap-y-8">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-brown">
            {tf("operation")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {operationOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={operation === opt.value}
                onClick={() => setOperation(opt.value)}
                className={`${pillBase} ${operation === opt.value ? pillOn : pillOff}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-3">
          <label
            htmlFor="filter-zone"
            className="text-[11px] uppercase tracking-[0.18em] text-brown"
          >
            {tf("zone")}
          </label>
          <select
            id="filter-zone"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
            className="min-w-[12rem] rounded-card border border-line bg-cream px-4 py-2.5 text-[13px] text-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown"
          >
            <option value="all">{tf("all")}</option>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-3 text-[11px] uppercase tracking-[0.18em] text-brown">
            {tf("bedrooms")}
          </legend>
          <div className="flex flex-wrap gap-2">
            {BEDROOM_OPTIONS.map((opt) => (
              <button
                key={String(opt)}
                type="button"
                aria-pressed={bedrooms === opt}
                onClick={() => setBedrooms(opt)}
                className={`${pillBase} ${bedrooms === opt ? pillOn : pillOff}`}
              >
                {opt === "all" ? tf("all") : opt === 4 ? "4+" : opt}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="flex min-w-[14rem] flex-1 flex-col gap-3">
          <label
            htmlFor="filter-price"
            className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.18em] text-brown"
          >
            <span>{tf("price")}</span>
            <span className="font-sans text-[12px] normal-case tracking-normal text-deep/70">
              {currency.format(maxPrice)}
            </span>
          </label>
          <input
            id="filter-price"
            type="range"
            min={0}
            max={priceCeiling}
            step={50_000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full accent-clay"
          />
        </div>
      </div>
      )}

      <motion.ul
        key={displayed.map((p) => p._id).join("-")}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
        aria-live="polite"
        className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      >
        {displayed.map((p) => {
          const src = p.image?.asset
            ? urlFor(p.image).width(1000).height(750).fit("crop").url()
            : (fallbackFor.get(p._id) ?? FALLBACK_POOL[0]);

          const statusKey = statusLabelKey(p.status, p.operation);
          const closed = isClosed(p.status);

          return (
            <motion.li
              key={p._id}
              variants={item}
              className="flex flex-col overflow-hidden rounded-card border border-line bg-cream"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={src}
                  alt={p.image?.alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  // A closed operation sits a step back from the live listings:
                  // slightly desaturated, still a real photograph.
                  className={`object-cover ${closed ? "saturate-[0.65]" : ""}`}
                />
                <span className="absolute left-4 top-4 rounded-card bg-cream/90 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-brown backdrop-blur-sm">
                  {p.neighbourhood}
                </span>
                {statusKey && (
                  <StatusBadge className="absolute right-4 top-4">
                    {tp(`status.${statusKey}`)}
                  </StatusBadge>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-4 p-6">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-clay">
                    {p.operation === "venta" ? tf("sale") : tf("rent")}
                  </p>
                  <p
                    className={`mt-1 font-serif leading-none text-brown ${
                      p.price == null ? "text-[20px] text-brown/70" : "text-[26px]"
                    }`}
                  >
                    {p.price == null
                      ? tp("status.priceHidden")
                      : currency.format(p.price)}
                  </p>
                </div>

                <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-deep/75">
                  {p.surface != null && (
                    <li
                      className="flex items-center gap-1.5"
                      aria-label={`${tc("surface")}: ${p.surface} m²`}
                    >
                      <Maximize2 className="h-4 w-4 text-muted" strokeWidth={1.5} aria-hidden />
                      {p.surface} m²
                    </li>
                  )}
                  {p.bedrooms != null && (
                    <li
                      className="flex items-center gap-1.5"
                      aria-label={`${tc("bedrooms")}: ${p.bedrooms}`}
                    >
                      <BedDouble className="h-4 w-4 text-muted" strokeWidth={1.5} aria-hidden />
                      {p.bedrooms}
                    </li>
                  )}
                  {p.bathrooms != null && (
                    <li
                      className="flex items-center gap-1.5"
                      aria-label={`${tc("bathrooms")}: ${p.bathrooms}`}
                    >
                      <Bath className="h-4 w-4 text-muted" strokeWidth={1.5} aria-hidden />
                      {p.bathrooms}
                    </li>
                  )}
                </ul>

                {p.description && (
                  <p className="text-[14px] leading-[1.55] text-deep/80">
                    {p.description}
                  </p>
                )}

                <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
                  {p.slug && (
                    <CTALink href={`/${locale}/properties/${p.slug}`}>
                      {tp("cardViewLabel")}
                    </CTALink>
                  )}
                  <a
                    href={contactoHref(locale, {
                      propiedad: p.slug,
                      titulo: p.title,
                      interes: p.operation === "venta" ? "buy" : "rent",
                    })}
                    className="text-[11px] uppercase tracking-[0.16em] text-brown/70 underline-offset-4 transition-colors duration-300 hover:text-brown hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-cream"
                  >
                    {tc("cta")}
                  </a>
                </div>
              </div>
            </motion.li>
          );
        })}
      </motion.ul>

      {isHome && (
        <div className="mt-12">
          <CTALink href={`/${locale}/properties`}>{t("viewAll")}</CTALink>
        </div>
      )}
    </Section>
  );
}
