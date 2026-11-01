interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const tracker = new Map<string, RateLimitRecord>();

// Periodic cleanup of stale records every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tracker.entries()) {
      if (now > value.resetAt) {
        tracker.delete(key);
      }
    }
  }, 300000);
}

/**
 * Lightweight in-memory rate limiter with sliding window.
 * Protects endpoints from abuse, credential stuffing, and resource exhaustion.
 */
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetInMs: number } {
  const now = Date.now();
  const record = tracker.get(identifier);

  if (!record || now > record.resetAt) {
    tracker.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { success: true, remaining: limit - 1, resetInMs: windowMs };
  }

  if (record.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetInMs: Math.max(0, record.resetAt - now),
    };
  }

  record.count += 1;
  return {
    success: true,
    remaining: limit - record.count,
    resetInMs: Math.max(0, record.resetAt - now),
  };
}
