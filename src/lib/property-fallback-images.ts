/**
 * Warm Mediterranean interior placeholders for property pages, used only until
 * a property has its own gallery in Sanity (brief §9 allows interim imagery).
 * `fallbackImagesFor` rotates the pool by a hash of the property key so
 * different properties lead with different images.
 */
export const PROPERTY_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600210492493-0946911123ea?auto=format&fit=crop&w=1800&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1800&q=85",
] as const;

export function fallbackImagesFor(key: string): string[] {
  const offset =
    [...key].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) %
    PROPERTY_FALLBACK_IMAGES.length;
  return [
    ...PROPERTY_FALLBACK_IMAGES.slice(offset),
    ...PROPERTY_FALLBACK_IMAGES.slice(0, offset),
  ];
}
