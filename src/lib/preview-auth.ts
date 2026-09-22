/**
 * Team-access token for the holding-page gate.
 *
 * Web Crypto only — no Node built-ins — so the exact same module runs in
 * `src/proxy.ts` (whatever runtime it lands on) and in the login server action.
 *
 * The cookie carries an HMAC-signed `v1.<expiry>.<signature>`, never a
 * "logged in" boolean: without PREVIEW_SECRET a visitor cannot forge one, and
 * rotating PREVIEW_SECRET silently invalidates every cookie already issued
 * (verification fails → the holding page comes back → people log in again).
 */

/** Bumped only if the payload shape changes; old cookies then stop verifying. */
const TOKEN_VERSION = "v1";

/** Deliberately unrevealing — it shouldn't advertise what it unlocks. */
export const ACCESS_COOKIE = "cm_access";

export const ACCESS_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

const encoder = new TextEncoder();

function signingKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(buffer: ArrayBuffer): string {
  let binary = "";
  for (const byte of new Uint8Array(buffer)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Pinned to `Uint8Array<ArrayBuffer>` (not the default ArrayBufferLike) so it
// satisfies crypto.subtle.verify's BufferSource, which excludes SharedArrayBuffer.
function fromBase64Url(value: string): Uint8Array<ArrayBuffer> | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const binary = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
    const bytes = new Uint8Array(new ArrayBuffer(binary.length));
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
  } catch {
    // Malformed cookie — treat as "no cookie" rather than throwing in the proxy.
    return null;
  }
}

/** Fixed-time byte comparison. Both inputs here are 32-byte HMAC digests. */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Compares against PREVIEW_PASSWORD without leaking the match position through
 * timing: both strings are HMAC'd under a random per-request key, so the
 * digests are unpredictable and always the same length, and the comparison
 * below runs the full loop regardless of where the inputs diverge.
 *
 * Fails closed when PREVIEW_PASSWORD is unset — an unconfigured deploy must
 * not be openable with an empty password.
 */
export async function verifyPreviewPassword(submitted: string): Promise<boolean> {
  const expected = process.env.PREVIEW_PASSWORD;
  if (!expected) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    crypto.getRandomValues(new Uint8Array(32)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const [a, b] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(submitted)),
    crypto.subtle.sign("HMAC", key, encoder.encode(expected)),
  ]);

  return timingSafeEqual(new Uint8Array(a), new Uint8Array(b));
}

/** Returns null when PREVIEW_SECRET is unset, so the caller can refuse to log in. */
export async function createAccessToken(now = Date.now()): Promise<string | null> {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret) return null;

  const payload = `${TOKEN_VERSION}.${now + ACCESS_TTL_SECONDS * 1000}`;
  const key = await signingKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  return `${payload}.${toBase64Url(signature)}`;
}

/** True only for a well-formed, correctly signed, unexpired token. */
export async function verifyAccessToken(
  raw: string | undefined | null,
): Promise<boolean> {
  const secret = process.env.PREVIEW_SECRET;
  if (!secret || !raw) return false;

  const [version, expiry, signature, ...rest] = raw.split(".");
  if (rest.length > 0 || version !== TOKEN_VERSION || !expiry || !signature) {
    return false;
  }

  const expiresAt = Number(expiry);
  if (!Number.isSafeInteger(expiresAt)) return false;

  const bytes = fromBase64Url(signature);
  if (!bytes) return false;

  const key = await signingKey(secret);
  const signed = await crypto.subtle.verify(
    "HMAC",
    key,
    bytes,
    encoder.encode(`${version}.${expiry}`),
  );

  // Expiry is only honoured once the signature is known-good, so a visitor
  // cannot extend their own session by editing the cookie.
  return signed && expiresAt > Date.now();
}

/**
 * Shared by the login action and the logout route so the two agree exactly —
 * a cookie is only cleared if the attributes match the ones it was set with.
 */
export function accessCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };
}
