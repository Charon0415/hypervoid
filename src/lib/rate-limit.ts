const store = new Map<string, { count: number; resetAt: number }>();

const cleanup = () => {
  const now = Date.now();
  for (const [k, v] of store) {
    if (now > v.resetAt) store.delete(k);
  }
};

interface RateLimitOptions {
  /** Max requests within the window */
  limit: number;
  /** Window duration in seconds */
  windowSec: number;
  /** Key prefix (e.g. "subscribe") */
  key: string;
}

export function rateLimit(
  identifier: string,
  opts: RateLimitOptions,
): { ok: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const k = `rl:${opts.key}:${identifier}`;
  const entry = store.get(k);

  if (!entry || now > entry.resetAt) {
    const resetAt = now + opts.windowSec * 1000;
    store.set(k, { count: 1, resetAt });
    return { ok: true, remaining: opts.limit - 1, resetInSec: opts.windowSec };
  }

  entry.count++;
  if (entry.count > opts.limit) {
    return {
      ok: false,
      remaining: 0,
      resetInSec: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  return {
    ok: true,
    remaining: opts.limit - entry.count,
    resetInSec: Math.ceil((entry.resetAt - now) / 1000),
  };
}

// Periodic cleanup every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(cleanup, 5 * 60 * 1000);
}
