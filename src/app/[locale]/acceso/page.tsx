import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { AccessForm } from "./AccessForm";

// Reachable whether or not the holding page is on: it has to stay outside the
// gate (it's the only way through it), and leaving it up after launch lets the
// team log in ahead of a flag flip. `src/proxy.ts` excludes it explicitly.
export function generateMetadata(): Metadata {
  return {
    // Deliberately says nothing about what this page is — the title shows up in
    // browser history, shared screenshots and any crawler that ignores robots.
    title: { absolute: "Casa Madre" },
    robots: { index: false, follow: false },
    // Not in sitemap.ts either: that file builds from explicit path lists.
    alternates: {},
  };
}

export default async function AccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-ivory px-6 py-16">
      <AccessForm />
    </main>
  );
}
