// Simple in-memory sliding-window-ish rate limiter. Good enough to blunt brute-force /
// spam abuse on a single long-lived Node process (this app runs as one instance on Render).
// It resets on deploy/restart and does not coordinate across multiple instances — if this
// app is ever scaled horizontally, replace this with a shared store (e.g. Redis/Upstash).
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
let lastSweep = 0;

function sweep(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/** Returns true if `key` is still within `limit` calls per `windowMs`, false if it should be rejected. */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (now - lastSweep > windowMs) {
    sweep(now);
    lastSweep = now;
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count++;
  return true;
}

/** Best-effort client IP from Render's edge proxy headers. Falls back to a shared bucket if absent. */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}
