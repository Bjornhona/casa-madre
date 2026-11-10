import { test, expect, type Page } from "@playwright/test";
import { MENU_ROUTES, NAV_ROUTES } from "../src/lib/nav-routes";
import { JOURNAL_ENABLED } from "../src/lib/features";
import esMessages from "../messages/es.json";
import enMessages from "../messages/en.json";

/**
 * Smoke test for the full-screen overlay navigation (src/components/SiteNav.tsx).
 * Covers: open/close, body-scroll lock, Escape, focus return, navigation, and
 * per-locale labels.
 *
 * The expected items are derived from MENU_ROUTES (the same list the nav
 * renders) and the next-intl catalogs, so adding, removing or relabelling a
 * route can't silently drift from this test. In particular it stays correct
 * whichever way JOURNAL_ENABLED is flipped.
 */

const LOCALES = ["es", "en"] as const;

const CATALOGS = { es: esMessages, en: enMessages };

// Labels live in the next-intl catalogs; read them from there rather than
// restating them here.
function navMessages(locale: (typeof LOCALES)[number]) {
  return CATALOGS[locale].nav as {
    menu: string;
    close: string;
    items: Record<string, { label: string; subtitle: string }>;
  };
}

// What the overlay should show for a locale: label + locale-prefixed href,
// in order.
function expectedItems(locale: (typeof LOCALES)[number]) {
  const { items } = navMessages(locale);
  return MENU_ROUTES.map(({ key, href }) => ({
    key,
    label: items[key].label,
    href: `/${locale}${href}`,
  }));
}

// Locale-independent handle on the menu toggle.
const toggle = (page: Page) => page.locator('button[aria-controls="nav-overlay"]');

const bodyOverflow = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).overflow);

// Every link rendered in the overlay's item list, in DOM order.
const menuLinks = (page: Page) =>
  page.getByRole("dialog").locator("nav ul li a");

for (const locale of LOCALES) {
  test.describe(`overlay navigation menu (${locale})`, () => {
    test("opens, locks scroll, lists exactly the nav routes, closes on Escape", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);

      const t = toggle(page);
      await expect(t).toHaveAttribute("aria-expanded", "false");

      await t.click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(t).toHaveAttribute("aria-expanded", "true");

      // Exactly the routes the nav is configured with — same count, same
      // order, same hrefs. No hardcoded list to go stale.
      const expected = expectedItems(locale);
      const links = menuLinks(page);
      await expect(links).toHaveCount(expected.length);

      const hrefs = await links.evaluateAll((els) =>
        els.map((e) => e.getAttribute("href")),
      );
      expect(hrefs).toEqual(expected.map((e) => e.href));

      // And each one carries its translated label.
      for (const [i, item] of expected.entries()) {
        await expect(links.nth(i)).toContainText(item.label);
      }

      // Body scroll is locked while the overlay is open.
      expect(await bodyOverflow(page)).toBe("hidden");

      // Escape closes the overlay and returns focus to the toggle…
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();
      await expect(t).toBeFocused();

      // …and the body scroll lock is released.
      expect(await bodyOverflow(page)).not.toBe("hidden");
    });

    test("Journal item tracks the JOURNAL_ENABLED flag", async ({ page }) => {
      await page.goto(`/${locale}`);
      await toggle(page).click();
      await expect(page.getByRole("dialog")).toBeVisible();

      // Scoped to the overlay's own list — the home page carries its own
      // journal links (teaser cards, "view all") when the flag is on, and
      // those are not this spec's business. Asserted against the live DOM
      // rather than MENU_ROUTES, so it's a real check in both flag states
      // rather than a tautology.
      const journalItem = page
        .getByRole("dialog")
        .locator('nav ul li a[href$="/journal"]');
      await expect(journalItem).toHaveCount(JOURNAL_ENABLED ? 1 : 0);
    });

    test("clicking an item closes the menu and navigates to that route", async ({
      page,
    }) => {
      await page.goto(`/${locale}`);
      await toggle(page).click();

      // Drive whichever route sits second in the menu rather than naming one.
      const target = expectedItems(locale)[1];
      const dialog = page.getByRole("dialog");
      await dialog.getByRole("link", { name: new RegExp(target.label) }).click();

      await expect(dialog).toBeHidden();
      // Generous timeout: this is the first hit on that route, so a cold dev
      // server compiles it on demand, which can take well over the 5s default.
      await expect(page).toHaveURL(new RegExp(`${target.href}$`), {
        timeout: 30_000,
      });
    });

    test("the bar's own labels are translated", async ({ page }) => {
      await page.goto(`/${locale}`);
      const { menu, close } = navMessages(locale);

      const t = toggle(page);
      await expect(t).toContainText(menu);
      await t.click();
      await expect(t).toContainText(close);
    });
  });
}

test("every nav route has a label and subtitle in both catalogs", () => {
  // Guards the whole list, not just the currently-enabled subset — so the
  // Journal's copy is still verified while it's hidden.
  for (const locale of LOCALES) {
    const { items } = navMessages(locale);
    for (const { key } of NAV_ROUTES) {
      expect(items[key]?.label, `${locale}: nav.items.${key}.label`).toBeTruthy();
      expect(
        items[key]?.subtitle,
        `${locale}: nav.items.${key}.subtitle`,
      ).toBeTruthy();
    }
  }
});
