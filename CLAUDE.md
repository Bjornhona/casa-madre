@AGENTS.md

# Casa Madre

Premium bilingual (ES/EN) one-page site for a boutique Barcelona real-estate firm.
Canonical spec — design tokens, approved copy, scope: **`context/casa-madre-build-brief.md`**.
Read it before building or styling anything, and follow it.

## Design standard (premium brand — judge every choice against this)
- Favour restraint and whitespace over density. Typography-led, editorial, warm Mediterranean.
- Premium = confident emptiness + consistency, NOT more effects.
- Motion is slow and eased (~0.7s, custom cubic-bezier), never bouncy. Respect `prefers-reduced-motion`.
- If a choice looks generic or templated, it's wrong — refine it.

## Architecture rules (non-negotiable)
- All colours/fonts/spacing come from the Tailwind v4 `@theme` tokens in `globals.css`.
  NEVER hardcode hex values, font names, or magic spacing — extend tokens/primitives instead.
- Compose sections from shared primitives in `src/components/ui`
  (Section, Kicker, SerifHeading, CTALink). Don't re-style per section.
- User-facing copy lives in next-intl catalogs (`messages/es.json`, `messages/en.json`).
  ES = approved text; EN = natural adaptation, not literal. Never hardcode strings.
- Animations: `motion/react` (not `framer-motion`); add `"use client"` to files using it.
- Images: `next/image` always; `priority` on the hero (it's the LCP element).
- Mobile-first, fully responsive.

## Using the ui-ux-pro-max skill
Use it for UX guidelines, accessibility, animation best-practice, and Next.js + Tailwind
patterns ONLY. Do NOT let it override the established Casa Madre tokens, palette, or fonts —
the design system is already defined in the brief.

## Workflow
- Build ONE vertical slice to full fidelity, then STOP for review before continuing.
- After changes: run the dev server, confirm `/es` renders, summarise what changed.

## Stack
Next.js (App Router, TS) · Tailwind v4 · next-intl (es default, en) · Sanity (embedded /studio)
· motion/react · react-hook-form + zod · Resend · lucide-react.
