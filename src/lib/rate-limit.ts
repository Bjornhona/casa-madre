/**
 * Best-effort in-process sliding-window limiter.
 *
 * IMPORTANT — this is a speed bump, not a security boundary. The window lives
 * in module memory, so on Vercel each serverless instance keeps its own counts
 * and a cold start resets them. It defeats a casual password guesser hammering
 * one connection; it does not defeat a distributed one. The real limiter for
 * /acceso is a Vercel Firewall rate-limit rule (see README) — this exists so
 * the app is not defenceless without it.
 */

type Window = { limit: number; windowMs: number };

const hits = new Map<string, number[]>();

/**
 * Records an attempt and reports whether it is allowed. Prunes as it goes, so
 * the map stays proportional to the number of *active* keys rather than to
 * every IP ever seen.
 */
export function consumeAttempt(
  key: string,
  { limit, windowMs }: Window,
  now = Date.now(),
): { allowed: boolean; retryAfterMs: number } {
  const cutoff = now - windowMs;

  for (const [existing, timestamps] of hits) {
    const live = timestamps.filter((t) => t > cutoff);
    if (live.length === 0) hits.delete(existing);
    else hits.set(existing, live);
  }

  const recent = hits.get(key) ?? [];
  if (recent.length >= limit) {
    return { allowed: false, retryAfterMs: recent[0] + windowMs - now };
  }

  hits.set(key, [...recent, now]);
  return { allowed: true, retryAfterMs: 0 };
}

/** Clears the window for a key — called on a successful login. */
export function resetAttempts(key: string): void {
  hits.delete(key);
}
