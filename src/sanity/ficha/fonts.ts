import { Font } from "@react-pdf/renderer";

/**
 * Font registration for the ficha, at module scope — never inside a component.
 * `Font.register` mutates a global store, so calling it during render would
 * re-register on every pass.
 *
 * The ficha renders in the browser, inside Sanity Studio, so sources are public
 * URLs served from /public/fonts — not disk reads. (`src/lib/og-font.ts` reads
 * from disk with `process.cwd()`, but that runs server-side for ImageResponse
 * and is unrelated to this path.) All four faces are static TTFs:
 * @react-pdf/renderer cannot use variable fonts or the woff2 that next/font
 * emits for the site itself.
 */

Font.register({
  family: "Inter",
  fonts: [
    { src: "/fonts/Inter_18pt-Regular.ttf", fontWeight: 400 },
    { src: "/fonts/Inter_18pt-Medium.ttf", fontWeight: 500 },
    { src: "/fonts/Inter_18pt-SemiBold.ttf", fontWeight: 600 },
  ],
});

Font.register({
  family: "Cormorant Garamond",
  fonts: [{ src: "/fonts/CormorantGaramond-SemiBold.ttf", fontWeight: 600 }],
});

// Disable hyphenation entirely. The built-in callback is English-centric and
// breaks Spanish words at points where Spanish does not hyphenate; returning
// the word whole is correct for both languages we publish.
Font.registerHyphenationCallback((word) => [word]);
