"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { fadeUp } from "@/lib/motion";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP;
const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

// Where the map card links out to. Swap the query for the real street address
// once the client confirms it (kept in one place for an easy edit).
const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Barcelona+Spain";

/**
 * Address details + a static, privacy-friendly map card.
 *
 * An interactive embedded map (Google Maps iframe / JS SDK) is intentionally NOT
 * used: it loads third-party scripts and sets cookies before consent (GDPR) and
 * hurts performance. The card is a plain styled image that links out to the
 * user's maps app. Revisit an embedded map in Phase 2, behind cookie consent.
 */
export function ContactDetails() {
  const t = useTranslations("contacto.details");
  const reduce = useReducedMotion();
  const item = fadeUp(reduce);

  return (
    <motion.div
      variants={item}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="mt-16 grid gap-12 border-t border-line pt-16 lg:grid-cols-2 lg:gap-20"
    >
      {/* Details */}
      <dl className="flex flex-col gap-8">
        <div className="flex items-start gap-4">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-clay" strokeWidth={1.5} aria-hidden />
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-brown">
              {t("addressTitle")}
            </dt>
            <dd className="mt-1 text-[16px] leading-[1.6] text-deep/80">{t("address")}</dd>
          </div>
        </div>

        {CONTACT_EMAIL && (
          <div className="flex items-start gap-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-clay" strokeWidth={1.5} aria-hidden />
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-brown">
                {t("emailTitle")}
              </dt>
              <dd className="mt-1 text-[16px] leading-[1.6]">
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-deep/80 transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                >
                  {CONTACT_EMAIL}
                </a>
              </dd>
            </div>
          </div>
        )}

        {WHATSAPP && (
          <div className="flex items-start gap-4">
            <Phone className="mt-0.5 h-5 w-5 shrink-0 text-clay" strokeWidth={1.5} aria-hidden />
            <div>
              <dt className="text-[11px] uppercase tracking-[0.16em] text-brown">
                {t("phoneTitle")}
              </dt>
              <dd className="mt-1 text-[16px] leading-[1.6]">
                <a
                  href={`tel:+${WHATSAPP}`}
                  className="text-deep/80 transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
                >
                  {`+${WHATSAPP}`}
                </a>
              </dd>
            </div>
          </div>
        )}

        <div className="flex items-start gap-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-clay" strokeWidth={1.5} aria-hidden />
          <div>
            <dt className="text-[11px] uppercase tracking-[0.16em] text-brown">
              {t("hoursTitle")}
            </dt>
            <dd className="mt-1 text-[16px] leading-[1.6] text-deep/80">{t("hours")}</dd>
          </div>
        </div>
      </dl>

      {/* Static map card — links out to the user's maps app (no embedded map JS). */}
      <a
        href={MAPS_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t("directions")}
        className="group relative block overflow-hidden rounded-card border border-line shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
      >
        <div className="relative aspect-[4/3] w-full">
          <Image
            src="/map-placeholder.jpg"
            alt=""
            fill
            sizes="(min-width: 1024px) 40vw, 100vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
          {/* Warm overlay for brand consistency + legibility of the pin/label. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/45 via-deep/5 to-transparent" />

          {/* Centred location pin. */}
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[140%]">
            <MapPin
              className="h-9 w-9 text-clay drop-shadow-[0_2px_6px_rgba(43,33,27,0.4)]"
              strokeWidth={1.75}
              fill="currentColor"
              aria-hidden
            />
          </span>

          {/* Neighbourhood label + directions caption. */}
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5">
            <span className="font-serif text-[20px] leading-tight tracking-[-0.02em] text-cream">
              {t("address")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-cream/90">
              {t("directions")}
              <ArrowUpRight
                className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                strokeWidth={1.5}
                aria-hidden
              />
            </span>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
