import { motion, Variants } from "motion/react";
import { PUBLISHED_TESTIMONIALS_QUERY_RESULT } from "@/sanity/types.gen";

interface TestimonyCardProps {
  testimonial: PUBLISHED_TESTIMONIALS_QUERY_RESULT[number];
  single: boolean;
  item: Variants;
}

const TestimonyCard = ({ testimonial, single, item }: TestimonyCardProps) => {
  return (
    <motion.li
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
  );
};

export default TestimonyCard;
