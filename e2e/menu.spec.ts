import { test, expect, type Page } from "@playwright/test";

/**
 * Smoke test for the full-screen overlay navigation (src/components/SiteNav.tsx).
 * Covers: open/close, body-scroll lock, Escape, focus return, smooth-scroll to
 * anchor, and per-locale labels.
 */

// Locale-independent handle on the menu toggle.
const toggle = (page: Page) => page.locator('button[aria-controls="nav-overlay"]');

const bodyOverflow = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).overflow);

test.describe("overlay navigation menu", () => {
  test("opens, locks scroll, lists all sections, closes on Escape (es)", async ({
    page,
  }) => {
    await page.goto("/es");

    const t = toggle(page);
    await expect(t).toHaveAttribute("aria-expanded", "false");

    await t.click();

    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(t).toHaveAttribute("aria-expanded", "true");

    // All six section links are present.
    for (const label of [
      "Nosotras",
      "Servicios",
      "Método",
      "Barrios",
      "Propiedades",
      "Contacto",
    ]) {
      await expect(
        dialog.getByRole("link", { name: new RegExp(label) }),
      ).toBeVisible();
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

  test("clicking a section closes the menu and scrolls to its anchor (es)", async ({
    page,
  }) => {
    await page.goto("/es");
    await toggle(page).click();

    const dialog = page.getByRole("dialog");
    await dialog.getByRole("link", { name: /Propiedades/ }).click();

    await expect(dialog).toBeHidden();
    await expect(page.locator("#propiedades")).toBeInViewport({ timeout: 5_000 });
  });

  test("renders English labels in the en locale", async ({ page }) => {
    await page.goto("/en");

    const t = toggle(page);
    await expect(t).toContainText("Menu");

    await t.click();
    const dialog = page.getByRole("dialog");
    for (const label of [
      "About",
      "Services",
      "Method",
      "Neighbourhoods",
      "Properties",
      "Contact",
    ]) {
      await expect(
        dialog.getByRole("link", { name: new RegExp(label) }),
      ).toBeVisible();
    }
  });
});
