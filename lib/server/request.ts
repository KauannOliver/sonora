import { USER_KEY_HEADERS } from "@/lib/constants";
import type { Provider } from "@/types/api";
import { ApiError } from "./errors";
import { checkRateLimit } from "./rate-limit";

/** Identifica o visitante pelo IP (atrás de proxy usa x-forwarded-for). */
export function getClientId(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip =
    (forwarded ? forwarded.split(",")[0].trim() : "") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "local";
  return ip;
}

/** Lê a chave pessoal enviada pelo navegador (se houver). Nunca é armazenada. */
export function getUserKey(req: Request, provider: Provider): string | null {
  const raw = req.headers.get(USER_KEY_HEADERS[provider]);
  if (!raw) return null;
  const key = raw.trim();
  if (key.length < 10 || key.length > 256 || /\s/.test(key)) return null;
  return key;
}

export function enforceRateLimit(id: string, limit: number) {
  const r = checkRateLimit(id, limit);
  if (!r.success) {
    const retry = Math.ceil((r.resetTime - Date.now()) / 1000);
    throw new ApiError(
      429,
      "RATE_LIMIT",
      `Muitas solicitações em pouco tempo. Aguarde ${retry}s e tente novamente.`,
      undefined,
      retry
    );
  }
}
