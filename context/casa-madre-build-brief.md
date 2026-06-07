# Casa Madre — Build Brief & Project Spec

*Real estate boutique · Barcelona · one-page premium launch (Phase 1)*
*Prepared from client questionnaire + approved design concept. Use as canonical context for Cursor / Claude Code + UI UX Pro Max.*

---

## 1. Project snapshot

| | |
|---|---|
| **Client** | Casa Madre — boutique real estate + lifestyle, Barcelona |
| **Deliverable (Phase 1)** | One-page premium site, bilingual ES/EN |
| **Primary message** | A boutique agency combining closeness, judgement, aesthetic sensibility and end-to-end support — *more than a property* |
| **Feeling** | Confidence, calm, inspiration, warmth. Premium but human, never cold/corporate |
| **Stack** | Next.js (App Router) · TypeScript · Tailwind · Sanity · Framer Motion · `next-intl` for i18n |

---

## 2. Brand foundation

**One-liner (approved):** *Casa Madre es una inmobiliaria boutique en Barcelona especializada en compra, venta, alquiler e inversión de propiedades con una mirada cercana, estratégica y estética.*

**Claim:** "Where living begins" · **Descriptor:** "Properties & Lifestyle"

**Brand words:** Boutique · Elegante · Mediterránea · Cercana · Premium · Editorial · Cálida · Discreta

**Voice — DO:** warm, editorial, emotional *but clear*; premium without being cold; human.
**Voice — DON'T:** aggressive/salesy, generic real-estate clichés, cold luxury, overly poetic/abstract that hides what they actually do.

**Bilingual rule:** Spanish primary. English is a *natural adaptation*, not literal translation — keep the premium, warm, editorial register in both. Interleaved phrases across languages are intentional brand texture.

---

## 3. Design system (locked — from approved concept)

**Fonts** (Google Fonts):
- Headings/display: **Cormorant Garamond** (500), tight tracking `-0.035em`
- Body/UI: **Inter** (base weight **300**), line-height ~1.55

**Color tokens:**
```
--ivory  #F4EDE3   (page background)
--cream  #FBF6EF   (light text on dark / cards)
--sand   #D7C1A8
--clay   #A06A43   (accent — terracotta)
--brown  #6B3E21   (headings accent, CTA borders)
--deep   #2B211B   (primary text)
--muted  #6E5C4F   (secondary text)
--line   rgba(43,33,27,.14)  (hairline borders)
```

**Layout principles:**
- Generous vertical rhythm — sections ~92px padding desktop
- Hairline `1px` borders, near-flat corners (`2px` radius), soft long shadows `0 24px 80px rgba(43,33,27,.13)`
- Kickers: 11–12px, UPPERCASE, letterspacing `.16–.22em`, in `--brown`
- "CM" monogram + wordmark "CASA MADRE" in serif, wide tracking
- Editorial two-column splits (image + text), full-bleed Mediterranean photography
- The **Método** block inverts to a dark-brown background with cream text

**Token mapping — Tailwind v4 (CSS-first, in `src/app/globals.css`):**
```css
@import "tailwindcss";

@theme {
  --color-ivory:  #F4EDE3;
  --color-cream:  #FBF6EF;
  --color-sand:   #D7C1A8;
  --color-clay:   #A06A43;
  --color-brown:  #6B3E21;
  --color-deep:   #2B211B;
  --color-muted:  #6E5C4F;
  --font-serif: var(--font-cormorant), serif;   /* Cormorant Garamond via next/font */
  --font-sans:  var(--font-inter), sans-serif;   /* Inter via next/font */
}
```
Auto-generates `bg-clay`, `text-brown`, `border-sand`, `font-serif`, etc. No JS config file in v4. *(If the project is on Tailwind v3, use the old `tailwind.config.ts` `theme.extend` form instead — but new installs should be v4.)*

---

## 4. Sitemap & scope

**PHASE 1 — launch (one page, anchored sections):**
1. Hero
2. Qué es Casa Madre (intro + image)
3. Nosotras / About
4. Servicios (6 services)
5. Método Casa Madre (5 steps)
6. Barcelona / Barrios (editorial)
7. Propiedades (6–12, Sanity-managed, light filters) — *see §6*
8. Contacto (form + WhatsApp + email)
9. Footer (legal, language switch)

**PHASE 2 — deferred (name in proposal, don't build now):**
Journal/blog · individual neighbourhood SEO pages · off-market/private listings · "En casa de" editorial · per-service SEO pages · CRM integration · Calendly · final legal copy.

> Proposal leverage: quote Phase 1 as a fixed deliverable; list Phase 2 as a roadmap. Protects scope and gives them an upsell path.

---

## 5. Section content spec (approved copy)

**Hero** — Wordmark CASA MADRE · "Properties and Lifestyle" · claim **"Where living begins"** · CTA **"Cuéntanos qué buscas"**. Mediterranean full-bleed image, scroll-down cue.

**Qué es Casa Madre** — Kicker "Qué es Casa Madre". Headline: *"Antes de encontrar tu casa, queremos que te sientas en casa."* (approved, do not change). Short narrative on origin + intention. CTA "Conócenos".

**Nosotras** — *"Dos miradas. Una misma forma de entender el hogar."* Founders: one from international advertising (Cannes/San Sebastián festivals), one from interior design. Met when one captured the other's flat. Strategy + sensibility + craft. Real names/bios + editorial photos TBD by client → build with placeholders.

**Servicios** (6, each card = icon + title + one-line + CTA):
| Service | Line | CTA |
|---|---|---|
| Compraventa | Acompañamos cada operación con estrategia, valoración y sensibilidad. | Quiero comprar o vender |
| Alquileres | Viviendas para cada momento: temporada y larga estancia. | Buscar o alquilar vivienda |
| Personal Shopper | Buscamos por ti. Entendemos, filtramos y encontramos. | Buscar por mí |
| Reformas & Home Staging | Transformamos espacios para que cuenten su mejor versión. | Transformar mi vivienda |
| Inversión | Analizamos, valoramos y te ayudamos a tomar decisiones acertadas. | Analizar una inversión |
| Jurídico & Financiero | Procesos legales y financieros con transparencia y rigor. | Resolver mi operación |

**Método Casa Madre** (dark section, 5 numbered steps): 01 Te conocemos · 02 Damos sentido · 03 Valoramos · 04 Menos, pero mejor · 05 Se convierte en método. Intro: *"Entender primero. Buscar después."*

**Barrios** (editorial, launch set): Sarrià · Sant Gervasi · Turó Park · Eixample · Gràcia · Pedralbes (El Born, Poblenou optional). Each = name + lifestyle one-liner. Mockup shows Gràcia / Eixample / Sarrià / Pedralbes as the first four cards.

**Propiedades** — 6–12 listings. Fields: price, zone, surface, beds/baths, short editorial description, image gallery, highlights, contact button. Filters (simple): venta/alquiler · zona · tipo · price range · bedrooms. Manual entry via Sanity now; CRM later.

**Contacto** — Single elegant form: Nombre · Email · Teléfono · interés selector (comprar/vender/alquilar/invertir) · presupuesto · zona preferida · mensaje. Plus WhatsApp button + email. Calendly = Phase 2.

**Footer** — legal links (placeholder until client's lawyer delivers), language switch, "Casa Madre · Barcelona · Properties and Lifestyle".

---

## 6. Technical architecture

**Routing / i18n:** App Router with `[locale]` segment (`es` default, `en`). `next-intl`. Approved copy keyed in message catalogs; English = adapted, not auto-translated.

**Sanity — minimal Phase 1 schema:**
- `property` — title, slug, price, operation (venta|alquiler), neighbourhood (ref), type, surface, bedrooms, bathrooms, description (localized), gallery[], highlights[], isPublic (bool, for off-market later)
- `neighbourhood` — name, slug, lifestyle blurb (localized), image (powers Barrios + filters)
- `testimonial` — quote, attribution, isPublished
- (`teamMember`, `service`, `journalPost` can stay hardcoded for launch — promote to Sanity only if client wants self-editing)

**Animations (Motion — `motion/react`, restrained):** section fade/translate on scroll-in (`whileInView`); hero text stagger on mount; subtle image parallax. Slow, custom-eased (~0.7s, e.g. `[0.22,1,0.36,1]`), never bouncy — real estate = trust = restraint. Add `"use client"` to any file using it, and honour `useReducedMotion`. Pull **one** "wow" moment from 21st.dev max — don't over-animate before Wednesday.

**Forms:** `react-hook-form` + zod; submit via API route → Resend (you already use it). Add WhatsApp deep link (`https://wa.me/<number>`).

---

## 7. Open decisions to raise with client (Wednesday)

1. **Founders' real names, bios, photos** — needed for Nosotras (currently placeholder structure).
2. **Domain + brand email** (hello@ / hola@ / info@casamadre…) — undecided.
3. **WhatsApp / phone number** for the brand.
4. **Initial property set** — which 6–12, with images + descriptions ready?
5. **Legal texts** — confirm their lawyer/gestoría delivers aviso legal, privacidad, cookies before launch (they flagged this is pending).
6. **Visual assets** — confirm interim image sources; some brand/property photography still in production.

---

## 8. Recommended build order (Sat → Tue)

1. **Scaffold** Next.js + TS + Tailwind v4 (tokens in `@theme`) + `next-intl` skeleton.
2. **Static one-pager** — all sections, real copy, placeholder images, fully responsive. *This is your Wednesday demo even if nothing else lands.*
3. **Motion** (`motion/react`) scroll reveals + hero stagger.
4. **Sanity** — schema + Studio; wire `property` + `neighbourhood` into Propiedades/Barrios so the CMS is demonstrably real.
5. **Contact form** functional (Resend + WhatsApp + consent + spam guard — see §9).
6. **Polish** — one 21st.dev moment, spacing pass, EN adaptation pass, a11y + Lighthouse pass.
7. **Deploy to Vercel** — get a live URL so Wednesday is a real site on her phone, not localhost.
8. **Proposal doc** — scope (Phase 1 fixed / Phase 2 roadmap), timeline, investment, screenshots of the live demo + Sanity Studio.

---

## 9. Quality & launch foundations (premium = these, not just looks)

**Accessibility — watch the warm palette.** The strength of this concept (warm, low-contrast) is also its risk. `--muted` and `--sand` on `--ivory`, and clay/brown CTAs, can fail WCAG AA. Verify contrast (target AA: 4.5:1 body, 3:1 large text); darken text tones if needed rather than ship pretty-but-illegible. Visible focus states on all interactive elements, semantic landmarks, alt text on imagery, and `prefers-reduced-motion` respected throughout.

**Performance / Core Web Vitals.** Image-heavy premium site lives or dies on this. Use `next/image` everywhere; `priority` on the hero (it's the LCP element), explicit sizes, lazy-load below the fold, modern formats. Subset the two Google fonts via `next/font` (already planned) to avoid layout shift. Aim Lighthouse ≥ 90 across the board — it's a credibility signal in the proposal.

**SEO foundations (ship in Phase 1 even though SEO *pages* are Phase 2).** Per-locale `metadata` (title/description), **`hreflang` alternates for es/en**, canonical URLs, Open Graph + a branded OG image (CM monogram), `RealEstateAgent`/`LocalBusiness` JSON-LD, and a localized `sitemap.ts` + `robots.ts`. This is cheap now and painful to retrofit. Target terms are in the questionnaire (inmobiliaria boutique Barcelona, luxury real estate Barcelona, etc.).

**Privacy / GDPR (Spain–EU, non-negotiable for a data-collecting site).** The contact form gathers personal data (name, email, phone, budget) → add a **consent checkbox** linking to the privacy policy, a **honeypot + basic rate-limit** for spam, and store/transmit data lawfully (Resend email is fine; no unnecessary retention). If analytics are added, a **cookie-consent banner** before non-essential cookies fire. Legal copy is client-supplied (their lawyer) — build the routes with clearly-marked placeholders so launch isn't blocked on your side.

**Config via env (no hardcoded contact details).** `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CONTACT_EMAIL`, `SANITY_*`, `RESEND_API_KEY`. All are "pending" client decisions — env vars let you ship with placeholders and swap in seconds.

**Image art direction.** Interim images are explicitly allowed at launch. Keep them coherent: consistent warm grade, similar focal treatment, generous negative space. One unifying overlay token keeps mixed-source placeholders from looking mismatched. Define standard aspect ratios (hero, property card, editorial split) up front.

**Favicon / brand.** CM monogram as favicon + app icons; OG image using the wordmark.

---

## 10. Premium elevation directions — *optional, to present if she opens the door Wednesday*

Build the approved concept faithfully first (it's your safety net). Keep *one* of these ready to show or describe as an upsell, not a speculative rebuild:

1. **Editorial asymmetry** — break the centred layout with an asymmetric magazine grid (offset images, large margins, a vertical rhythm that feels like a print spread). Highest impact, lowest code cost on a tokenised system.
2. **Scroll choreography** — a single signature moment: hero image slow-scale parallax + a horizontal "Barrios" scroll, or stat counters in the Método section. One memorable beat, not many.
3. **Material warmth** — a whisper of paper grain on the ivory, hairline rules, refined optical typography (tighter display tracking, italic accents). Pure craft, reads expensive.

> Framing for the meeting: *"Here's your approved concept, built and live. And here's a direction I'd push if you want to go further."* Options, not a redo — that's the consultant move, and it justifies extra scope/budget.

---

## 11. Portfolio / flagship note

This doubles as a flagship piece for asaeriksson.com: it demonstrates design sensibility **and** engineering (i18n, headless CMS architecture, motion craft, performance). Get Casa Madre's sign-off to feature it (low-sensitivity once public, but ask). Worth adding as a differentiator if time allows post-launch: a light **Vitest + Playwright** smoke test of the contact form and key sections — cheap to add, strong portfolio signal.
