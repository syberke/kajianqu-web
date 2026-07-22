interface Bucket {
  count: number
  resetAt: number
}

const globalBuckets = globalThis as typeof globalThis & { kajianQuRateLimits?: Map<string, Bucket> }
const buckets = globalBuckets.kajianQuRateLimits ?? new Map<string, Bucket>()
globalBuckets.kajianQuRateLimits = buckets

export function requestIdentity(request: Request, userId?: string) {
  if (userId) return `user:${userId}`
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return `ip:${forwarded || request.headers.get('x-real-ip') || 'unknown'}`
}

export function checkRateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key)
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  return { allowed: true, remaining: limit - current.count, retryAfterSeconds: 0 }
}
