"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Section } from "@/components/ui/Section";
import { Kicker } from "@/components/ui/Kicker";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { PUBLISHED_TESTIMONIALS_QUERY_RESULT } from "@/sanity/types.gen";

/**
 * Quiet, editorial testimonials — large serif italic quote, muted attribution.
 * Centres a single quote; lays 2–3 out in a balanced grid. Presentational only:
 * the locale-resolved data is fetched by the `Testimonios` server component.
 */
export function TestimoniosView({
  testimonials,
}: {
  testimonials: PUBLISHED_TESTIMONIALS_QUERY_RESULT;
}) {
  const t = useTranslations("testimonios");
  const reduce = useReducedMotion();
  const container = staggerContainer(reduce, 0.12);
  const item = fadeUp(reduce, { y: 20, duration: 0.7 });

  const single = testimonials.length === 1;

  return (
    <Section id="testimonios" aria-labelledby="testimonios-kicker">
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={item}>
          <Kicker id="testimonios-kicker">{t("kicker")}</Kicker>
        </motion.div>
        <motion.p
          variants={item}
          className="mt-6 max-w-[46rem] font-serif text-[24px] leading-[1.2] text-deep sm:text-[29px]"
        >
          {t("intro")}
        </motion.p>

        <motion.ul
          variants={container}
          className={
            single
              ? "mt-16 flex justify-center"
              : "mt-16 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
          }
        >
          {testimonials.map((testimonial) => (
            <motion.li
              key={testimonial._id}
              variants={item}
              className={single ? "max-w-[44rem] text-center" : ""}
            >
              <figure>
                <blockquote
                  className={`font-serif italic tracking-[-0.02em] text-brown ${
                    single
                      ? "text-[28px] leading-[1.3] sm:text-[36px]"
                      : "text-[23px] leading-[1.35] sm:text-[26px]"
                  }`}
                >
                  {testimonial.quote}
                </blockquote>
                <figcaption className="mt-6 text-[12px] uppercase tracking-[0.16em] text-muted">
                  {`— ${testimonial.attribution}`}
                </figcaption>
              </figure>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </Section>
  );
}
