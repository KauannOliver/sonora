// ### rota de api para transcricao de audio em lote com groq whisper large v3 ###
import { NextResponse } from "next/server";
import { TRANSCRIBE_CONFIG } from "@/lib/constants";
import { ApiError, toErrorResponse } from "@/lib/server/errors";
import { transcribeWithGroq } from "@/lib/server/groq";
import { getDefaultGroqKeys } from "@/lib/server/keys";
import {
  consumeQuota,
  getQuota,
  isProviderExhausted,
  providerExhaustedSecondsLeft,
} from "@/lib/server/quota";
import { enforceRateLimit, getClientId, getUserKey } from "@/lib/server/request";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: Request) {
  try {
    const clientId = getClientId(req);
    const userKey = getUserKey(req, "groq");

    // ### controle de taxa de chamadas por ip ###
    enforceRateLimit(`stt:${clientId}`, userKey ? 40 : 15);

    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Envie o áudio como multipart/form-data no campo 'file'.");
    }

    const file = form.get("file");
    if (!file || typeof file === "string") {
      throw new ApiError(400, "BAD_REQUEST", "Nenhum arquivo de áudio foi enviado.");
    }

    const name = file.name.toLowerCase();
    const okExt = TRANSCRIBE_CONFIG.allowedExtensions.some((ext) => name.endsWith(ext));
    if (!okExt && !file.type.startsWith("audio/") && !file.type.startsWith("video/")) {
      throw new ApiError(400, "BAD_REQUEST", "Formato não suportado. Envie MP3, WAV, M4A, OGG, WEBM ou FLAC.");
    }
    if (file.size > TRANSCRIBE_CONFIG.maxFileBytes) {
      throw new ApiError(413, "BAD_REQUEST", "O arquivo excede o limite de 25 MB por áudio.");
    }

    // ### processamento com chave pessoal do usuario se fornecida ###
    if (userKey) {
      const result = await transcribeWithGroq(file, [{ name: "Sua chave Groq", key: userKey }], true);
      return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
    }

    // ### chaves padrao integradas do sonora para cota gratuita ###
    const keys = getDefaultGroqKeys();
    if (keys.length === 0 || isProviderExhausted("groq")) {
      const wait = providerExhaustedSecondsLeft("groq");
      throw new ApiError(
        429,
        "FREE_LIMIT_REACHED",
        "O limite gratuito de Sonora Scribe do site foi atingido. Cadastre sua própria chave Groq (é grátis) para continuar.",
        "groq",
        wait
      );
    }

    // ### verificacao de cota diaria do visitante ###
    const quota = getQuota(clientId, "transcribe");
    if (quota.remaining <= 0) {
      throw new ApiError(
        429,
        "FREE_LIMIT_REACHED",
        `Você já usou as ${quota.limit} transcrições gratuitas de hoje. Cadastre sua própria chave Groq para continuar.`,
        "groq"
      );
    }

    const result = await transcribeWithGroq(file, keys, false);
    consumeQuota(clientId, "transcribe", 1);

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
        "X-Free-Remaining": String(getQuota(clientId, "transcribe").remaining),
      },
    });
  } catch (err) {
    return toErrorResponse(err, "groq", "API Transcribe");
  }
}
