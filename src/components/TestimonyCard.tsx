import { motion, Variants } from "motion/react";
import { PUBLISHED_TESTIMONIALS_QUERY_RESULT } from "@/sanity/types.gen";

interface TestimonyCardProps {
  testimonial: PUBLISHED_TESTIMONIALS_QUERY_RESULT[number];
  single: boolean;
  item: Variants;
}

const TestimonyCard = ({ testimonial, single, item }: TestimonyCardProps) => {
  if (single) {
    return (
      <motion.li variants={item} className="max-w-[48rem] text-center">
        <figure>
          <span
            aria-hidden
            className="block font-serif text-[80px] leading-[0.5] text-sand"
          >
            &ldquo;
          </span>
          <blockquote className="mt-4 font-serif italic tracking-[-0.02em] text-brown text-[30px] leading-[1.3] sm:text-[38px]">
            {testimonial.quote}
          </blockquote>
          <figcaption className="mt-8 flex items-center justify-center gap-3 text-[12px] uppercase tracking-[0.16em] text-muted">
            <span aria-hidden className="h-px w-6 bg-clay/50" />
            {testimonial.attribution}
          </figcaption>
        </figure>
      </motion.li>
    );
  }

  return (
    <motion.li variants={item} className="h-full">
      <figure className="flex h-full flex-col rounded-card border border-line bg-cream/40 p-8 transition-colors duration-500 hover:border-sand hover:bg-cream/70">
        <span
          aria-hidden
          className="font-serif text-[64px] leading-[0.5] text-sand"
        >
          &ldquo;
        </span>
        <blockquote className="mt-4 flex-1 font-serif italic tracking-[-0.02em] text-brown text-[22px] leading-[1.4] sm:text-[24px]">
          {testimonial.quote}
        </blockquote>
        <figcaption className="mt-8 flex items-center gap-3 text-[12px] uppercase tracking-[0.16em] text-muted">
          <span aria-hidden className="h-px w-6 bg-clay/50" />
          {testimonial.attribution}
        </figcaption>
      </figure>
    </motion.li>
  );
};

export default TestimonyCard;
