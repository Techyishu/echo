/**
 * In-memory rate limiter — per IP + global daily cap.
 * Survives Next.js hot reloads via Node.js globals.
 */

interface IPRecord {
  count: number;
  windowStart: number; // timestamp ms
}

interface GlobalRecord {
  count: number;
  dayStart: number; // timestamp ms (midnight UTC)
}

interface RateLimitStore {
  perIP: Map<string, IPRecord>;
  global: Map<string, GlobalRecord>;
}

declare global {
  // eslint-disable-next-line no-var
  var __rateLimitStore: RateLimitStore | undefined;
}

const store: RateLimitStore = global.__rateLimitStore ?? {
  perIP: new Map(),
  global: new Map(),
};
if (!global.__rateLimitStore) global.__rateLimitStore = store;

// Limits per route key
const LIMITS: Record<string, { perIP: number; windowMs: number; globalPerDay: number }> = {
  "research-figure":    { perIP: 5,  windowMs: 60 * 60 * 1000, globalPerDay: 120 },
  "start-conversation": { perIP: 10, windowMs: 60 * 60 * 1000, globalPerDay: 250 },
  "save-transcript":    { perIP: 20, windowMs: 60 * 60 * 1000, globalPerDay: 500 },
};

function startOfDayUTC(): number {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
}

export function checkRateLimit(
  routeKey: string,
  ip: string
): { allowed: boolean; reason?: string; retryAfterSeconds?: number } {
  const limit = LIMITS[routeKey];
  if (!limit) return { allowed: true };

  const now = Date.now();
  const ipKey = `${routeKey}:${ip}`;

  // ── Per-IP sliding window ──
  const ipRecord = store.perIP.get(ipKey);
  if (ipRecord && now - ipRecord.windowStart < limit.windowMs) {
    if (ipRecord.count >= limit.perIP) {
      const retryAfterSeconds = Math.ceil((limit.windowMs - (now - ipRecord.windowStart)) / 1000);
      return {
        allowed: false,
        reason: `Too many requests. You can make ${limit.perIP} requests per hour for this action.`,
        retryAfterSeconds,
      };
    }
    ipRecord.count++;
  } else {
    // Reset window
    store.perIP.set(ipKey, { count: 1, windowStart: now });
  }

  // ── Global daily cap ──
  const dayStart = startOfDayUTC();
  const globalRecord = store.global.get(routeKey);
  if (globalRecord && globalRecord.dayStart === dayStart) {
    if (globalRecord.count >= limit.globalPerDay) {
      return {
        allowed: false,
        reason: "Daily global limit reached. Please try again tomorrow.",
      };
    }
    globalRecord.count++;
  } else {
    store.global.set(routeKey, { count: 1, dayStart });
  }

  return { allowed: true };
}

export function getIP(request: Request): string {
  const forwarded = (request.headers as Headers).get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
