import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Loads the bundled Cormorant Garamond face for ImageResponse (OG image, icons).
 * Read from the project source at runtime — no external network dependency.
 */
export function loadSerifFont(): Promise<Buffer> {
  return readFile(
    join(process.cwd(), "/public/fonts/CormorantGaramond-SemiBold.ttf")
  );
}

/** Brand colour tokens, mirrored from the @theme palette for ImageResponse. */
export const BRAND = {
  ivory: "#F4EDE3",
  cream: "#FBF6EF",
  sand: "#D7C1A8",
  clay: "#A06A43",
  brown: "#6B3E21",
  deep: "#2B211B",
  muted: "#6E5C4F",
} as const;
