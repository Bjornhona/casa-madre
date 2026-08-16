"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Mail, MessageCircle, Phone } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { agentPhoneDigits, formatAgentPhone } from "@/lib/format-phone";
import { urlFor } from "@/sanity/lib/image";
import type { AGENTS_QUERY_RESULT } from "@/sanity/types.gen";

const linkClass =
  "text-deep/80 transition-colors duration-300 hover:text-brown focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown focus-visible:ring-offset-2 focus-visible:ring-offset-ivory";

/**
 * Personal contact cards for the team ("Habla con nosotras"), managed in
 * Sanity as `agent` documents. A quiet business-card block between the contact
 * form and the address/map details; when no agents exist yet the page falls
 * back to the generic env-var contact rows instead (see Contacto).
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
      className="mt-12 border-t border-line pt-12"
    >
      <h3 className="text-[11px] uppercase tracking-[0.16em] text-brown">
        {t("title")}
      </h3>

      <ul className="mt-6 grid max-w-4xl gap-8 sm:grid-cols-2">
        {agents.map((agent) => {
          // Phone is stored as international digits with an optional "+"
          // (see the agent schema). Both the call and WhatsApp rows derive
          // from it: tel/display carry the "+", wa.me wants bare digits.
          const phoneDigits = agentPhoneDigits(agent.phone);

          return (
            <li
              key={agent._id}
              className="rounded-card border border-line bg-bone p-6 shadow-soft"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border border-line">
                  {agent.photo?.asset ? (
                    <Image
                      src={urlFor(agent.photo).width(160).height(160).fit("crop").url()}
                      alt={agent.name}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  ) : (
                    // Quiet placeholder until the client provides photos.
                    <div
                      aria-hidden
                      className="flex h-full w-full items-center justify-center bg-cream"
                    >
                      <span className="font-serif text-[28px] tracking-[-0.035em] text-clay/50">
                        {agent.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <p className="font-serif text-[20px] font-medium leading-tight tracking-[-0.035em] text-brown">
                    {agent.name}
                  </p>
                  {agent.title && (
                    <p className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted">
                      {agent.title}
                    </p>
                  )}
                </div>
              </div>

              <dl className="mt-5 flex flex-col gap-3">
                {agent.email && (
                  <div className="flex items-start gap-3">
                    <Mail
                      className="mt-0.5 h-4 w-4 shrink-0 text-clay"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <dd className="text-[15px] leading-[1.6]">
                      <a href={`mailto:${agent.email}`} className={linkClass}>
                        {agent.email}
                      </a>
                    </dd>
                  </div>
                )}

                {phoneDigits && (
                  <div className="flex items-start gap-3">
                    <Phone
                      className="mt-0.5 h-4 w-4 shrink-0 text-clay"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <dd className="text-[15px] leading-[1.6]">
                      <a
                        href={`tel:${formatAgentPhone(agent.phone)}`}
                        className={linkClass}
                      >
                        {formatAgentPhone(agent.phone)}
                      </a>
                    </dd>
                  </div>
                )}

                {phoneDigits && (
                  <div className="flex items-start gap-3">
                    <MessageCircle
                      className="mt-0.5 h-4 w-4 shrink-0 text-clay"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <dd className="text-[15px] leading-[1.6]">
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

              {/* Individual AICAT registration — required in property
                  advertising in Catalunya. Omitted entirely when unset, so a
                  bare label never appears. */}
              {agent.aicat && (
                <p className="mt-5 text-[11px] uppercase tracking-[0.14em] text-muted">
                  {t("aicat", { number: agent.aicat })}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}
