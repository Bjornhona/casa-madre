"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Barrio = { name: string; description: string };

// Index-aligned with `barrios.items`: Sarrià, Sant Gervasi, Turó Park, Eixample, Gràcia, Pedralbes.
// Tasteful Barcelona street / architecture placeholders.
const IMAGES = [
  "https://images.unsplash.com/photo-1607706189992-eae578626c86?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1583422409516-2895a77efded?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1539037116277-4db20889f2d4?auto=format&fit=crop&w=900&q=85",
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=900&q=85",
];

export function Barrios() {
  const t = useTranslations("barrios");
  const items = t.raw("items") as Barrio[];
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce);

  return (
    <Section id="barrios" aria-labelledby="barrios-kicker">
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
        {items.map((barrio, index) => (
          <motion.li
            key={barrio.name}
            variants={item}
            className="overflow-hidden rounded-card border border-line bg-cream"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              <Image
                src={IMAGES[index] ?? IMAGES[0]}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
            </div>
            <div className="p-6">
              <SerifHeading as="h3" className="text-[26px] text-brown">
                {barrio.name}
              </SerifHeading>
              <p className="mt-3 text-[14px] leading-[1.55] text-deep/80">
                {barrio.description}
              </p>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </Section>
  );
}
