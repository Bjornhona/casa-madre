"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { urlFor } from "@/sanity/lib/image";
import type { NEIGHBOURHOODS_QUERY_RESULT } from "@/sanity/types.gen";

// Tasteful Barcelona placeholders, keyed by slug so they stay correct
// regardless of the editor's ordering. Used only until a neighbourhood has a
// real image in Sanity (brief §9 allows interim imagery).
const FALLBACK_IMAGES: Record<string, string> = {
  sarria: "https://images.unsplash.com/photo-1607706189992-eae578626c86?auto=format&fit=crop&w=900&q=85",
  "sant-gervasi": "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=900&q=85",
  "turo-park": "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=85",
  eixample: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
  gracia: "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85",
  pedralbes: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=85",
};

const GENERIC_FALLBACK =
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85";

export function Barrios({
  neighbourhoods,
}: {
  neighbourhoods: NEIGHBOURHOODS_QUERY_RESULT;
}) {
  const t = useTranslations("barrios");
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce);

  console.log(neighbourhoods);

  return (
    <Section id="barrios" aria-labelledby="barrios-kicker" className="border-line border-b-1">
      <Kicker id="barrios-kicker">{t("kicker")}</Kicker>
      <p className="mt-6 max-w-[46rem] font-serif text-[24px] leading-[1.2] text-deep sm:text-[29px]">
        {t("intro")}
      </p>

      <motion.ul
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
        className="mt-14 grid grid-cols-2 gap-5 lg:grid-cols-4"
      >
        {neighbourhoods.map((barrio) => {
          const src = barrio.image?.asset
            ? urlFor(barrio.image).width(900).height(675).fit("crop").url()
            : (FALLBACK_IMAGES[barrio.slug] ?? GENERIC_FALLBACK);

          return (
            <motion.li
              key={barrio._id}
              variants={item}
              className="overflow-hidden rounded-card border border-line bg-cream"
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <Image
                  src={src}
                  alt={barrio.image?.alt ?? ""}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <SerifHeading as="h3" className="text-[26px] text-brown">
                  {barrio.name}
                </SerifHeading>
                {barrio.blurb && (
                  <p className="mt-3 text-[14px] leading-[1.55] text-deep/80">
                    {barrio.blurb}
                  </p>
                )}
              </div>
            </motion.li>
          );
        })}
      </motion.ul>
    </Section>
  );
}
