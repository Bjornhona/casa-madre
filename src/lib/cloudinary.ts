/**
 * Delivery URLs for the Journal's owner-interview videos, which live on
 * Cloudinary rather than Sanity (Cloudinary transcodes on upload; Sanity does
 * not). The Studio uploader stores only the `publicId` and metadata — every
 * URL is built here.
 *
 * `w_720` is deliberate: these clips are shot vertically and never display
 * wider than ~420px, so 720 is already generous for a 2× screen while roughly
 * halving bandwidth against a limited monthly quota.
 *
 * The cloud name must be set at build time (NEXT_PUBLIC_* vars are inlined).
 * It's the same variable the Studio uploader requires, so if a video exists in
 * the dataset at all, it's set.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME

const BASE = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload`

/**
 * The video itself. No file extension — `f_auto:video` lets Cloudinary's CDN
 * pick the best container per browser, which it can only do when the extension
 * is absent.
 */
export function videoUrl(publicId: string): string {
  return `${BASE}/f_auto:video,q_auto,w_720/${publicId}`
}

/**
 * A still frame for the `poster` attribute, used when the editor hasn't
 * uploaded a custom one. `so_2` (two seconds in) rather than `so_0` because
 * frame zero of a talking-head clip is usually mid-blink.
 */
export function posterUrl(publicId: string): string {
  return `${BASE}/so_2,f_auto,q_auto,w_720/${publicId}.jpg`
}

/**
 * The `--color-deep` token, as a bare hex for Cloudinary's `b_rgb:` parameter.
 * A transformation string can't read a CSS variable, so this is the one place
 * the value is repeated — keep it in step with globals.css.
 */
const OG_PAD_COLOUR = '2B211B'

/**
 * A 1200×630 social card frame. Padded onto the brand background rather than
 * cropped: these clips are vertical, and cropping a talking head to a landscape
 * card cuts the speaker's head off.
 */
export function ogPosterUrl(publicId: string): string {
  return `${BASE}/so_2,c_pad,b_rgb:${OG_PAD_COLOUR},w_1200,h_630,f_auto,q_auto/${publicId}.jpg`
}
