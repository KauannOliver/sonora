interface RateLimitRecord {
  timestamps: number[];
}

const g = globalThis as unknown as { __voziaRate?: Map<string, RateLimitRecord> };
const rateLimitMap: Map<string, RateLimitRecord> = g.__voziaRate ?? new Map();
g.__voziaRate = rateLimitMap;

/**
 * Janela deslizante simples por identificador (proteção anti-abuso por minuto).
 */
export function checkRateLimit(
  identifier: string,
  limit: number,
  windowMs = 60_000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const windowStart = now - windowMs;
  const record = rateLimitMap.get(identifier) || { timestamps: [] };
  const valid = record.timestamps.filter((ts) => ts > windowStart);

  if (valid.length >= limit) {
    return { success: false, remaining: 0, resetTime: valid[0] + windowMs };
  }

  valid.push(now);
  rateLimitMap.set(identifier, { timestamps: valid });

  if (rateLimitMap.size > 1000) {
    for (const [key, val] of rateLimitMap.entries()) {
      const active = val.timestamps.filter((ts) => ts > windowStart);
      if (active.length === 0) rateLimitMap.delete(key);
      else rateLimitMap.set(key, { timestamps: active });
    }
  }

  return { success: true, remaining: limit - valid.length, resetTime: now + windowMs };
}
