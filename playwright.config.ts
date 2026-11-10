import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for Casa Madre smoke tests.
 *
 * Two servers, because the site has two faces: the real site, and the
 * holding page that `NEXT_PUBLIC_COMING_SOON` puts in front of it. Nearly
 * every test wants the former; one small spec covers the latter.
 */

// Deliberately NOT 3000. The everyday `pnpm dev` lives there, and sharing the
// port meant a run would either abort ("Another next dev server is already
// running") or — worse — silently reuse your gated dev server and fail every
// test against the holding page. On their own ports the suite and your dev
// server simply ignore each other. Override if these clash with something.
const PORT = Number(process.env.E2E_PORT ?? 3100);
const GATE_PORT = PORT + 1;
const BASE_URL = `http://localhost:${PORT}`;
const GATE_URL = `http://localhost:${GATE_PORT}`;

// The holding-page spec is the only one that wants the gate on.
const HOLDING_PAGE = /coming-soon\.spec\.ts/;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], baseURL: BASE_URL },
      testIgnore: HOLDING_PAGE,
    },
    {
      name: "coming-soon",
      use: { ...devices["Desktop Chrome"], baseURL: GATE_URL },
      testMatch: HOLDING_PAGE,
    },
  ],
  webServer: [
    {
      // The suite tests the real site, so the gate must be OFF here.
      // `.env.local` sets NEXT_PUBLIC_COMING_SOON=true for everyday local
      // work; a real environment variable outranks .env files in Next, so this
      // overrides it for the test server only — .env.local is never touched.
      //
      // DO NOT REMOVE. Without it the proxy rewrites every route to the
      // holding page, which renders no SiteNav at all, and every nav and page
      // test fails with "element not found" rather than anything informative.
      command: `pnpm dev --port ${PORT}`,
      url: BASE_URL,
      env: {
        NEXT_PUBLIC_COMING_SOON: "false",
        // Its own build dir, so a `pnpm dev` you already have running doesn't
        // make this one bail out — see the note in next.config.ts.
        NEXT_DIST_DIR: ".next-e2e",
      },
      // Reuse a server left over from a previous run instead of aborting.
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      // The gate's own server, so the holding page can be covered without
      // turning it on for everything else. NEXT_DIST_DIR is what lets this run
      // alongside the server above — see the note in next.config.ts.
      command: `pnpm dev --port ${GATE_PORT}`,
      url: GATE_URL,
      env: {
        NEXT_PUBLIC_COMING_SOON: "true",
        NEXT_DIST_DIR: ".next-e2e-gate",
      },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
});
