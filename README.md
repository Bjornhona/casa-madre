# Casa Madre

Bilingual (ES/EN) marketing site and CMS for a Barcelona real-estate firm.

**Live:** set per environment via `NEXT_PUBLIC_SITE_URL`. ⚠️ The canonical domain is recorded inconsistently in the repo (`src/lib/legal-data.ts` says `.com`; `.env.example` example says `.es`) — confirm the live domain and reconcile both before relying on canonical/OG URLs.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.2.7 (App Router, Turbopack), React 19 |
| Language | TypeScript, `strict` |
| Styling | Tailwind v4 — tokens in `@theme` in `src/app/globals.css`. No config file |
| CMS | Sanity v5, Studio embedded at `/studio` |
| i18n | `next-intl` — `es` default, `en` secondary |
| Animation | `motion/react` |
| Forms | `react-hook-form` + `zod`; email via `nodemailer` (SMTP) |
| Media | Sanity images; Cloudinary for video |
| AI | `@anthropic-ai/sdk`, server-only |
| Tests | Playwright (one e2e spec) |

**Next 16 note:** middleware is renamed — the file is `src/proxy.ts`, not `middleware.ts`. Consult `node_modules/next/dist/docs/` before assuming older App Router conventions.

## Setup

Requires **Node 20+** and **pnpm**. Copy `.env.example` to `.env.local` and fill it in.

```bash
pnpm install
pnpm dev          # http://localhost:3000 → redirects to /es
```

Other scripts: `pnpm build`, `pnpm lint`, `pnpm typegen` (regenerate Sanity types — run after any schema change), `pnpm test:e2e`.

### Environment variables

Names and purpose only; get values from the project owner or the hosting dashboard.

- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` — public Sanity identifiers.
- `SANITY_API_READ_TOKEN` — **server-only.** Must be on the base client in `src/sanity/lib/client.ts`, not only on `defineLive`'s `serverToken`, or published content silently disappears.
- `NEXT_PUBLIC_SANITY_API_VERSION` — optional; falls back to a hardcoded date in `src/sanity/env.ts`.
- `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS`, `CONTACT_TO` — contact-form delivery. Port 587 = STARTTLS, 465 = implicit TLS. **If unset, `/api/contact` logs and returns success without sending** — verify real delivery before launch.
- `NEXT_PUBLIC_SITE_URL` — canonical/OG/sitemap base, no trailing slash.
- `NEXT_PUBLIC_WHATSAPP`, `NEXT_PUBLIC_CONTACT_EMAIL` — public contact channels.
- `CLIENT_LEGAL_NAME`, `CLIENT_TAX_ID`, `CLIENT_CONTACT_EMAIL`, `CLIENT_CONTACT_PHONE`, `CLIENT_AICAT`, `CLIENT_NPIFF` — legally required disclosures rendered on `/legal` and `/privacy`. Personal data: keep out of source control.
- `ANTHROPIC_API_KEY` — **server-only, billed.** See AI integration below.
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` — public; appears in every delivery URL.
- `NEXT_PUBLIC_COMING_SOON` — `"true"` rewrites all public routes to a holding page. `NEXT_PUBLIC_*` vars are inlined at build time; redeploy after changing.

## Content model

Studio at `/studio`, five document types (`src/sanity/schemaTypes/`): **Propiedades**, **Barrios**, **Testimonios**, **Artículos del Journal**, **Equipo**.

Short localized fields use `internationalizedArray` (ES + EN side by side). Long-form bodies are **separate `bodyEs` / `bodyEn` Portable Text fields** — the plugin doesn't handle block content. Queries coalesce to Spanish, so a missing EN translation falls back rather than rendering blank.

Visibility is per-document: `isPublic` (properties) and `isPublished` (journal, testimonials). Unpublished slugs 404 and stay out of the sitemap. Property `status` (`disponible`/`reservado`/`vendido`) sinks closed listings below available ones while preserving price order; sold properties intentionally keep their page. `ocultarPrecio` strips price in the GROQ query, not at render — do not "simplify" this to a render-time check, or the price leaks into page source.

All queries live in `src/sanity/lib/queries.ts`. After editing a schema, run `pnpm typegen`.

## Implementation notes

**Routing.** All pages sit under `src/app/[locale]/`. Routes were renamed Spanish→English; `next.config.ts` holds 12 permanent redirects preserving old links. Sanity slugs stayed Spanish. Never hardcode user-facing strings — they belong in `messages/es.json` / `messages/en.json` (ES is approved copy; EN is adaptation, not literal translation).

**Data fetching.** Two clients, deliberately. Use `sanityFetch` (`src/sanity/lib/live.ts`) inside request rendering. Use the plain `client` with `perspective: "published"` in `generateStaticParams` and `sitemap.ts` — `sanityFetch` reads `draftMode()` and throws outside a request. Pass `stega: false` in `generateMetadata` so editing markers don't leak into titles.

**Video pipeline.** Journal videos go to Cloudinary (it transcodes on upload; Sanity doesn't). Editors upload through an **unsigned** preset named `casamadre_journal` — no Cloudinary account or secret needed client-side. 50 MB cap. Poster frames are auto-derived. Requires `res.cloudinary.com` in `next.config.ts` `remotePatterns`.

**AI drafting — costs money.** Studio actions "Generar borrador con IA" (Journal) and "Generar ficha con IA" (Propiedades) POST to `/api/ai/draft`, which calls the Anthropic API server-side using `ANTHROPIC_API_KEY`. **Whoever owns that key pays per generation.** It is triggered manually by editors, so cost scales with editorial activity — there is no quota, throttle, or usage log. If handing the site to the client, either move the key to their Anthropic account or remove the actions from `sanity.config.ts`. The key must never reach the browser or Studio bundle. Model is pinned to `claude-sonnet-4-6` in the route; it is valid and active but no longer the current Sonnet.

**Contact form rate limit.** `/api/contact` allows 5 submissions/hour/IP via an in-memory map. On serverless this is per-instance and resets on redeploy, so the real limit is looser than it looks. Replace with a shared store if abuse appears.

## Deployment

Vercel is strongly implied (`.vercel` ignored, `_vercel` excluded in the proxy matcher) but **not declared in-repo** — confirm in the hosting dashboard. There is no CI: no workflow runs lint, typecheck, or tests on push. Set every variable above in the host's environment settings; `NEXT_PUBLIC_*` changes need a rebuild. Add the deployed domain to Sanity's CORS origins.

## Known limitations

1. **`pnpm build` currently fails.** `src/app/[locale]/legal/page.tsx:41` — `string | undefined` not assignable to `string`. Legal data was mid-refactor to read from `CLIENT_*` env vars; `.filter()` doesn't narrow the type. Also in `legal-data.ts`: phone renders `"+undefined"` when unset, and `formatLegalAddress()` emits a leading space and duplicated city while street/postcode are blank. **Fix before deploying.**
2. **No error boundaries or loading states.** No `error.tsx` / `loading.tsx` anywhere. A Sanity outage surfaces as an unstyled Next error page.
3. **Everything is dynamic SSR.** `sanityFetch` reads `draftMode()`, so pages render per-request and the `generateStaticParams` on detail routes doesn't prerender. `useCdn: true` softens this. ISR or next-sanity's `cacheComponents` + `sanityFetchStaticParams` path would fit better.
4. **Thin test coverage.** One Playwright spec covering nav only. No unit runner installed. Untested: contact API, AI JSON extraction, status labels, GROQ fallbacks, coming-soon rewrite.
5. **`robots.ts` allows everything,** including `/studio`, and ignores `NEXT_PUBLIC_COMING_SOON` — the holding page would be indexed as the whole site.
6. **Legal page has unconfirmed fields.** Street address, postcode, and registry data are blank pending client confirmation.

---

Design tokens, approved copy, and scope: `context/casa-madre-build-brief.md`. Agent conventions: `AGENTS.md`, `CLAUDE.md`.
