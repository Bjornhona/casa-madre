import { test, expect } from "@playwright/test";
import esMessages from "../messages/es.json";
import enMessages from "../messages/en.json";

/**
 * The holding page (src/proxy.ts + src/components/ComingSoon.tsx).
 *
 * This spec is the only one that runs with NEXT_PUBLIC_COMING_SOON=true — the
 * "coming-soon" project in playwright.config.ts points it at its own gated
 * server. Everything else runs against the real site. Keep it that way: the
 * gate rewrites *every* route, so running the rest of the suite behind it
 * fails every test for the same uninformative reason.
 */

const LOCALES = ["es", "en"] as const;
const CATALOGS = { es: esMessages, en: enMessages };

for (const locale of LOCALES) {
  test.describe(`holding page (${locale})`, () => {
    test("gates the real site and shows the holding page instead", async ({
      page,
    }) => {
      const t = CATALOGS[locale].comingSoon;

      // A normal route is rewritten, not redirected — the URL must stay put.
      await page.goto(`/${locale}/properties`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/properties$`));

      await expect(page.getByText(t.subtitle)).toBeVisible();

      // None of the real site leaks through: no nav, so no way in.
      await expect(
        page.locator('button[aria-controls="nav-overlay"]'),
      ).toHaveCount(0);
      await expect(page.locator("footer nav")).toHaveCount(0);
    });

    test("keeps the team access route reachable through the gate", async ({
      page,
    }) => {
      // Gating /acceso would lock out the only way past the gate.
      await page.goto(`/${locale}/acceso`);
      await expect(page).toHaveURL(new RegExp(`/${locale}/acceso$`));
      await expect(page.locator('input[type="password"]')).toBeVisible();
    });

    test("stays out of the search index", async ({ page }) => {
      await page.goto(`/${locale}`);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        "content",
        /noindex/,
      );
    });
  });
}
