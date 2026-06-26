"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useLocale, useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { CTALink } from "@/components/ui/CTALink";
import { EASE, fadeUp, staggerContainer } from "@/lib/motion";

// Founders portrait. Tasteful warm placeholder until the real photo is added —
// swap this for "/about/founders.jpg" (one line). Falls back to a neutral block
// if the image can't load, so the layout never breaks.
const FOUNDERS_IMAGE =
  "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=85";

/** Section 1 (continued) — the manifesto body beneath the hero. Calm, editorial. */
export function AboutManifesto() {
  const t = useTranslations("about.manifesto");
  const reduce = useReducedMotion();
  const body = t.raw("body") as string[];
  const container = staggerContainer(reduce);
  const item = fadeUp(reduce, { y: 20, duration: 0.7 });

  return (
    <Section className="border-line border-b-1">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-[60ch]"
      >
        {body.map((paragraph, i) => (
          <motion.p
            key={i}
            variants={item}
            className={`text-[19px] font-light leading-[1.8] text-deep/85 sm:text-[21px] ${
              i > 0 ? "mt-7" : ""
            }`}
          >
            {paragraph}
          </motion.p>
        ))}
      </motion.div>
    </Section>
  );
}

/** Section 2 — founders: the page's main visual + their story (currently pending). */
export function AboutFounders() {
  const t = useTranslations("about.founders");
  const reduce = useReducedMotion();
  const [imgFailed, setImgFailed] = useState(false);
  const container = staggerContainer(reduce);
  const item = fadeUp(reduce);

  return (
    <Section
      id="founders"
      aria-labelledby="founders-kicker"
      className="bg-cream border-line border-b-1"
    >
      <div className="grid items-center gap-12 md:grid-cols-2 md:gap-[70px]">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="relative order-last aspect-[4/5] w-full overflow-hidden rounded-card bg-sand/30 shadow-soft md:order-first"
        >
          {!imgFailed && (
            <Image
              src={FOUNDERS_IMAGE}
              alt=""
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
              onError={() => setImgFailed(true)}
            />
          )}
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
        >
          <motion.div variants={item}>
            <Kicker id="founders-kicker">{t("kicker")}</Kicker>
          </motion.div>
          <motion.p
            variants={item}
            className="mt-6 max-w-[34rem] text-[18px] leading-[1.7] text-deep/85"
          >
            {t("body")}
          </motion.p>
        </motion.div>
      </div>
    </Section>
  );
}

/** Section 3 — the Método, in the established dark-band numbered treatment. */
export function AboutMethod() {
  const t = useTranslations("about.method");
  const reduce = useReducedMotion();
  const steps = t.raw("steps") as {
    number: string;
    title: string;
    body: string;
  }[];
  const container = staggerContainer(reduce, 0.1);
  const item = fadeUp(reduce, { y: 16, duration: 0.8 });

  return (
    <Section
      id="metodo"
      aria-labelledby="about-method-kicker"
      className="bg-brown text-cream"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={item}>
          <Kicker id="about-method-kicker" tone="sand">
            {t("kicker")}
          </Kicker>
        </motion.div>
        <motion.div variants={item}>
          <SerifHeading
            as="h2"
            className="mt-5 max-w-[24ch] text-[34px] leading-[1.04] sm:text-[48px]"
          >
            {t("title")}
          </SerifHeading>
        </motion.div>
        <motion.p
          variants={item}
          className="mt-6 max-w-[52ch] text-[16px] font-light leading-[1.7] text-cream/75"
        >
          {t("intro")}
        </motion.p>

        <motion.ol
          variants={container}
          className="mt-16 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-5"
        >
          {steps.map((step) => (
            <motion.li
              key={step.number}
              variants={item}
              className="border-t border-cream/20 pt-6"
            >
              <span className="block font-serif text-[40px] leading-none text-sand">
                {step.number}
              </span>
              <h3 className="mt-5 text-[12px] font-semibold uppercase tracking-[0.16em] text-cream">
                {step.title}
              </h3>
              <p className="mt-3 text-[14px] leading-[1.55] text-cream/75">
                {step.body}
              </p>
            </motion.li>
          ))}
        </motion.ol>
      </motion.div>
    </Section>
  );
}

/** Section 4 — our network. A quiet editorial passage, no imagery. */
export function AboutNetwork() {
  const t = useTranslations("about.network");
  const reduce = useReducedMotion();
  const body = t.raw("body") as string[];
  const container = staggerContainer(reduce);
  const item = fadeUp(reduce);

  return (
    <Section
      id="network"
      aria-labelledby="network-kicker"
      className="border-line border-b-1 bg-bone"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
        className="max-w-[60ch]"
      >
        <motion.div variants={item}>
          <Kicker id="network-kicker">{t("kicker")}</Kicker>
        </motion.div>
        <motion.div variants={item}>
          <SerifHeading
            as="h2"
            className="mt-5 text-[30px] leading-[1.08] text-brown sm:text-[40px]"
          >
            {t("title")}
          </SerifHeading>
        </motion.div>
        {body.map((paragraph, i) => (
          <motion.p
            key={i}
            variants={item}
            className="mt-6 text-[17px] font-light leading-[1.8] text-deep/85"
          >
            {paragraph}
          </motion.p>
        ))}
      </motion.div>
    </Section>
  );
}

/** Section 6 — final CTA, dark band, to the contact page. */
export function AboutCta() {
  const t = useTranslations("about.ctaSection");
  const locale = useLocale();
  const reduce = useReducedMotion();

  return (
    <section className="px-6 pb-20 pt-2 sm:px-10 lg:px-12">
      <motion.div
        initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.7, ease: EASE }}
        className="mx-auto w-full max-w-[1240px] rounded-card bg-deep px-6 py-16 text-cream sm:px-12 lg:px-16"
      >
        <SerifHeading
          as="h2"
          className="max-w-[20ch] text-[30px] leading-[1.08] sm:text-[40px]"
        >
          {t("title")}
        </SerifHeading>
        <p className="mt-5 max-w-[48ch] text-[15px] font-light leading-[1.6] text-cream/75">
          {t("text")}
        </p>
        <div className="mt-9">
          <CTALink href={`/${locale}/contact`} variant="onDark">
            {t("button")}
          </CTALink>
        </div>
      </motion.div>
    </section>
  );
}
