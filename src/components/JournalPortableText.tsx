import Image from "next/image";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextBlock,
} from "@portabletext/react";
import { urlFor } from "@/sanity/lib/image";
import type { SanityImageSource } from "@sanity/image-url";

/**
 * Editorial Portable Text rendering for the Journal. Headings use Cormorant,
 * body copy uses Inter 300 on a generous measure (~65ch), blockquotes take the
 * clay accent, and inline images go through next/image. All tones come from the
 * Tailwind `@theme` tokens — no hardcoded values.
 */

type BodyImage = {
  _type: "image";
  alt?: string;
  asset?: { _ref?: string };
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-6 text-[17px] font-light leading-[1.8] text-deep/85">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-14 font-serif text-[30px] font-medium leading-[1.1] tracking-[-0.03em] text-deep sm:text-[36px]">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 font-serif text-[24px] font-medium leading-[1.15] tracking-[-0.025em] text-deep sm:text-[28px]">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="my-10 border-l-2 border-clay pl-6 font-serif text-[22px] italic leading-[1.45] text-brown sm:text-[26px]">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-6 list-disc space-y-2 pl-5 text-[17px] font-light leading-[1.7] text-deep/85 marker:text-clay">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-[17px] font-light leading-[1.7] text-deep/85 marker:text-clay">
        {children}
      </ol>
    ),
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-medium text-deep">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-brown underline decoration-clay/60 underline-offset-4 transition-colors duration-300 hover:decoration-clay"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }: { value: BodyImage }) => {
      if (!value?.asset) return null;
      const src = urlFor(value as SanityImageSource)
        .width(1400)
        .fit("max")
        .url();
      return (
        <figure className="my-12 overflow-hidden rounded-card bg-cream">
          <Image
            src={src}
            alt={value.alt ?? ""}
            width={1400}
            height={933}
            sizes="(min-width: 768px) 65ch, 100vw"
            className="h-auto w-full object-cover"
          />
        </figure>
      );
    },
  },
};

export function JournalPortableText({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
