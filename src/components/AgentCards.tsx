"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { SerifHeading } from "@/components/ui/SerifHeading";
import { fadeUp } from "@/lib/motion";
import { urlFor } from "@/sanity/lib/image";
import type { AGENTS_QUERY_RESULT } from "@/sanity/types.gen";

const linkClass =
  "text-deep/80 transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory";

/**
 * Personal contact cards for the team ("Habla con nosotras"), managed in
 * Sanity as `agent` documents. Rendered between the contact form and the
 * address/map block; when no agents exist yet the page falls back to the
 * generic env-var contact rows instead (see Contacto).
 */
export function AgentCards({ agents }: { agents: AGENTS_QUERY_RESULT }) {
  const t = useTranslations("contacto.agents");
  const reduce = useReducedMotion();
  const item = fadeUp(reduce);

  return (
    <motion.div
      variants={item}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      className="mt-16 border-t border-line pt-16"
    >
      <SerifHeading as="h3" className="text-[28px] text-brown">
        {t("title")}
      </SerifHeading>

      <ul className="mt-10 grid gap-8 sm:grid-cols-2">
        {agents.map((agent) => {
          // Phone is stored as international digits with an optional "+"
          // (see the agent schema). Both the call and WhatsApp rows derive
          // from it: tel/display carry the "+", wa.me wants bare digits.
          const phoneDigits = agent.phone?.replace(/^\+/, "");

          return (
            <li
              key={agent._id}
              className="group overflow-hidden rounded-card border border-line bg-bone shadow-soft"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden">
                {agent.photo?.asset ? (
                  <Image
                    src={urlFor(agent.photo).width(900).height(1200).fit("crop").url()}
                    alt={agent.name}
                    fill
                    sizes="(min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                ) : (
                  // Quiet placeholder until the client provides photos.
                  <div
                    aria-hidden
                    className="flex h-full w-full items-center justify-center bg-cream"
                  >
                    <span className="font-serif text-[64px] tracking-[-0.035em] text-clay/50">
                      {agent.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-7">
                <p className="font-serif text-[24px] font-medium leading-tight tracking-[-0.035em] text-brown">
                  {agent.name}
                </p>
                {agent.title && (
                  <p className="mt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted">
                    {agent.title}
                  </p>
                )}

                <dl className="mt-6 flex flex-col gap-4">
                  {agent.email && (
                    <div className="flex items-start gap-4">
                      <Mail
                        className="mt-0.5 h-5 w-5 shrink-0 text-clay"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <dd className="text-[16px] leading-[1.6]">
                        <a href={`mailto:${agent.email}`} className={linkClass}>
                          {agent.email}
                        </a>
                      </dd>
                    </div>
                  )}

                  {phoneDigits && (
                    <div className="flex items-start gap-4">
                      <Phone
                        className="mt-0.5 h-5 w-5 shrink-0 text-clay"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <dd className="text-[16px] leading-[1.6]">
                        <a href={`tel:+${phoneDigits}`} className={linkClass}>
                          {`+${phoneDigits}`}
                        </a>
                      </dd>
                    </div>
                  )}

                  {phoneDigits && (
                    <div className="flex items-start gap-4">
                      <MessageCircle
                        className="mt-0.5 h-5 w-5 shrink-0 text-clay"
                        strokeWidth={1.5}
                        aria-hidden
                      />
                      <dd className="text-[16px] leading-[1.6]">
                        <a
                          href={`https://wa.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClass}
                        >
                          {t("whatsapp")}
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
