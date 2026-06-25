import { notFound } from "next/navigation";

// Catches any unmatched path beneath a locale (e.g. /es/does-not-exist) and
// renders the localized not-found UI wrapped by the [locale] layout — so the
// 404 keeps the fonts, nav and i18n provider rather than Next's bare fallback.
export default function CatchAllPage() {
  notFound();
}
