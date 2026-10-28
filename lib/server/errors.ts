import { NextResponse } from "next/server";
import type { ApiErrorBody, ApiErrorCode, Provider } from "@/types/api";

/**
 * Erro padronizado das rotas de API. Sempre traz uma mensagem amigável em PT-BR
 * e um `code` que o front-end usa para decidir o que fazer (ex.: abrir o modal
 * de chave de API quando o limite gratuito acaba).
 */
export class ApiError extends Error {
  status: number;
  code: ApiErrorCode;
  provider?: Provider;
  retryAfterSeconds?: number;

  constructor(
    status: number,
    code: ApiErrorCode,
    message: string,
    provider?: Provider,
    retryAfterSeconds?: number
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.provider = provider;
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export function toErrorResponse(err: unknown, provider?: Provider, logTag = "API") {
  if (err instanceof ApiError) {
    const body: ApiErrorBody = {
      error: err.message,
      code: err.code,
      provider: err.provider ?? provider,
      retryAfterSeconds: err.retryAfterSeconds,
    };
    const headers: Record<string, string> = { "Cache-Control": "no-store" };
    if (err.retryAfterSeconds) headers["Retry-After"] = String(Math.ceil(err.retryAfterSeconds));
    return NextResponse.json(body, { status: err.status, headers });
  }

  console.error(`[${logTag}] Erro inesperado:`, err);
  const body: ApiErrorBody = {
    error: "O serviço está temporariamente indisponível. Tente novamente em alguns instantes.",
    code: "SERVER_ERROR",
    provider,
  };
  return NextResponse.json(body, { status: 500 });
}
