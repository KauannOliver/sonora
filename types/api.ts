export type Provider = "elevenlabs" | "groq";

export type ApiErrorCode =
  | "FREE_LIMIT_REACHED"
  | "USER_KEY_INVALID"
  | "USER_KEY_QUOTA"
  | "VOICE_REQUIRES_PAID"
  | "RATE_LIMIT"
  | "BAD_REQUEST"
  | "NOT_FOUND"
  | "FORBIDDEN"
  | "SERVER_ERROR";

export interface ApiErrorBody {
  error: string;
  code: ApiErrorCode;
  provider?: Provider;
  retryAfterSeconds?: number;
}

export interface QuotaInfo {
  used: number;
  limit: number;
  remaining: number;
  /** true quando a chave padrão do site esgotou o plano gratuito no provedor */
  providerExhausted: boolean;
}

export interface UsageResponse {
  tts: QuotaInfo;
  transcribe: QuotaInfo;
  resetsAt: string;
}
