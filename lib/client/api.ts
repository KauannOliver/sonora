import type { ApiErrorBody, ApiErrorCode, Provider } from "@/types/api";

export class ApiClientError extends Error {
  code: ApiErrorCode;
  status: number;
  provider?: Provider;
  retryAfterSeconds?: number;

  constructor(body: ApiErrorBody, status: number) {
    super(body.error);
    this.name = "ApiClientError";
    this.code = body.code;
    this.status = status;
    this.provider = body.provider;
    this.retryAfterSeconds = body.retryAfterSeconds;
  }

  /** Erros que devem abrir o modal de chave de API */
  get needsUserKey(): boolean {
    return this.code === "FREE_LIMIT_REACHED" || this.code === "USER_KEY_INVALID" || this.code === "USER_KEY_QUOTA";
  }
}

export async function parseApiError(res: Response, provider?: Provider): Promise<ApiClientError> {
  const data = (await res.json().catch(() => null)) as Partial<ApiErrorBody> | null;
  return new ApiClientError(
    {
      error: data?.error || `Erro inesperado (HTTP ${res.status}). Tente novamente.`,
      code: (data?.code as ApiErrorCode) || "SERVER_ERROR",
      provider: data?.provider || provider,
      retryAfterSeconds: data?.retryAfterSeconds,
    },
    res.status
  );
}
