// ### cliente e servicos de integracao com a api da elevenlabs para sintese neural ###
import { TTS_CONFIG } from "@/lib/constants";
import type { GenerateSpeechParams, VoiceItem, VoicesApiResponse } from "@/types/elevenlabs";
import { ApiError } from "./errors";
import { clearProviderExhausted, markProviderExhausted, nextResetDate } from "./quota";

export interface KeyContext {
  apiKey: string;
  isUserKey: boolean;
}

const BASE = "https://api.elevenlabs.io";

// ### deteccao de vozes com suporte ou acento em portugues brasileiro ###
/* eslint-disable @typescript-eslint/no-explicit-any */
function isVoicePtBr(voice: any): { isPtBr: boolean; ptPreviewUrl?: string } {
  const verifiedLangs: any[] = voice.verified_languages || [];
  const ptVerified = verifiedLangs.find((vl) => {
    const lang = (vl.language || "").toLowerCase();
    const loc = (vl.locale || "").toLowerCase();
    const acc = (vl.accent || "").toLowerCase();
    return lang === "pt" || loc.includes("pt-br") || acc.includes("brazil") || acc.includes("brasileir");
  });
  if (ptVerified) {
    return { isPtBr: true, ptPreviewUrl: ptVerified.preview_url || voice.preview_url };
  }

  const labels = voice.labels || {};
  const accent = (labels.accent || "").toLowerCase();
  const language = (labels.language || "").toLowerCase();
  if (
    accent.includes("brazil") ||
    accent.includes("brasileir") ||
    accent.includes("portuguese") ||
    language === "pt" ||
    language.includes("portuguese")
  ) {
    return { isPtBr: true, ptPreviewUrl: voice.preview_url };
  }

  const desc = (voice.description || "").toLowerCase();
  const name = (voice.name || "").toLowerCase();
  const isTextPt =
    desc.includes("brazil") ||
    desc.includes("brasil") ||
    desc.includes("português") ||
    desc.includes("portugues") ||
    name.includes("pt-br") ||
    name.includes("brasil");

  return { isPtBr: isTextPt, ptPreviewUrl: voice.preview_url };
}

// ### consulta e paginacao de vozes disponiveis na api da elevenlabs ###
export async function fetchVoices(ctx: KeyContext): Promise<VoicesApiResponse> {
  const raw: any[] = [];
  let nextToken: string | null = null;
  let pages = 0;

  try {
    do {
      const url = new URL(`${BASE}/v2/voices`);
      url.searchParams.set("page_size", "100");
      url.searchParams.set("include_total_count", "false");
      if (nextToken) url.searchParams.set("next_page_token", nextToken);

      const res = await fetch(url.toString(), {
        headers: { "xi-api-key": ctx.apiKey },
        cache: "no-store",
      });
      if (!res.ok) {
        mapElevenLabsError(res.status, await res.text().catch(() => ""), ctx, "voices");
      }
      const data = await res.json();
      if (Array.isArray(data.voices)) raw.push(...data.voices);
      nextToken = data.has_more ? data.next_page_token : null;
      pages++;
    } while (nextToken && pages < 10);
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("[ElevenLabs] Falha ao buscar vozes:", (err as Error).message);
    throw new ApiError(502, "SERVER_ERROR", "Não foi possível conectar à ElevenLabs.", "elevenlabs");
  }

  let hasPtBr = false;
  const voices: VoiceItem[] = raw.map((v) => {
    const { isPtBr, ptPreviewUrl } = isVoicePtBr(v);
    if (isPtBr) hasPtBr = true;
    return {
      voiceId: v.voice_id,
      name: v.name,
      category: v.category,
      description: v.description,
      labels: v.labels || {},
      previewUrl: ptPreviewUrl || v.preview_url,
      verifiedLanguages: v.verified_languages,
      isPtBr,
      gender: v.labels?.gender,
      accent: v.labels?.accent,
      useCase: v.labels?.use_case,
    };
  });

  voices.sort((a, b) => {
    if (a.isPtBr !== b.isPtBr) return a.isPtBr ? -1 : 1;
    return a.name.localeCompare(b.name, "pt-BR");
  });

  return { voices, hasPtBr };
}

// ### sintese de audio neural enviando texto e parametros acusticos ###
export async function synthesize(ctx: KeyContext, params: GenerateSpeechParams): Promise<ArrayBuffer> {
  const text = (params.text || "").trim();
  if (!text) throw new ApiError(400, "BAD_REQUEST", "O texto para geração não pode estar vazio.");
  if (text.length > TTS_CONFIG.maxCharacters) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      `O texto excede o limite de ${TTS_CONFIG.maxCharacters.toLocaleString("pt-BR")} caracteres.`
    );
  }
  if (!params.voiceId) throw new ApiError(400, "BAD_REQUEST", "Selecione uma voz para continuar.");

  const s = params.voiceSettings || {};
  const d = TTS_CONFIG.defaultSettings;
  const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);

  const endpoint = `${BASE}/v1/text-to-speech/${encodeURIComponent(params.voiceId)}?output_format=${
    TTS_CONFIG.outputFormat
  }`;

  console.log(
    `[TTS] voiceId=${params.voiceId} chars=${text.length} chave=${ctx.isUserKey ? "usuário" : "site"}`
  );

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", "xi-api-key": ctx.apiKey },
      body: JSON.stringify({
        text,
        model_id: TTS_CONFIG.modelId,
        voice_settings: {
          stability: clamp(s.stability ?? d.stability, 0, 1),
          similarity_boost: clamp(s.similarityBoost ?? d.similarityBoost, 0, 1),
          style: clamp(s.style ?? d.style, 0, 1),
          use_speaker_boost: s.useSpeakerBoost ?? d.useSpeakerBoost,
          speed: clamp(s.speed ?? d.speed, 0.7, 1.2),
        },
        apply_text_normalization: "auto",
      }),
    });

    if (!res.ok) {
      mapElevenLabsError(res.status, await res.text().catch(() => ""), ctx, "tts");
    }

    const buffer = await res.arrayBuffer();
    if (!ctx.isUserKey) clearProviderExhausted("elevenlabs");
    return buffer;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    console.error("[ElevenLabs] Erro de comunicação:", (err as Error).message);
    throw new ApiError(502, "SERVER_ERROR", "Não foi possível conectar à ElevenLabs.", "elevenlabs");
  }
}

// ### validacao rapida de chave pessoal do usuario com endpoint leve ###
export async function validateElevenLabsKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    const res = await fetch(`${BASE}/v2/voices?page_size=1`, {
      headers: { "xi-api-key": apiKey },
      cache: "no-store",
    });
    if (res.ok) return { valid: true, message: "Chave ElevenLabs válida e pronta para uso." };
    const raw = await res.text().catch(() => "");
    if (raw.toLowerCase().includes("missing_permissions")) {
      return {
        valid: false,
        message: "A chave existe, mas não tem permissão de leitura de vozes (Voices → Read).",
      };
    }
    return { valid: false, message: "Chave ElevenLabs inválida ou revogada." };
  } catch {
    return { valid: false, message: "Não foi possível conectar à ElevenLabs para validar a chave." };
  }
}

// ### mapeamento de erros da elevenlabs com resposta amigavel e solicitacao de chave propria ###
function mapElevenLabsError(status: number, rawText: string, ctx: KeyContext, op: "tts" | "voices"): never {
  let json: any = null;
  try {
    json = JSON.parse(rawText);
  } catch {
    // ### formato de erro nao json ignorado ###
  }
  const detail = json?.detail ?? {};
  const code = String(typeof detail === "object" ? detail.code || detail.status || "" : "").toLowerCase();
  const message = String(
    (typeof detail === "object" ? detail.message : detail) || rawText || ""
  ).toLowerCase();

  console.warn(`[ElevenLabs] HTTP ${status} code=${code || "-"} (${ctx.isUserKey ? "usuário" : "site"})`);

  // ### vozes da biblioteca exigem plano pago na elevenlabs ###
  if (message.includes("library voice") || code === "paid_plan_required") {
    throw new ApiError(
      402,
      "VOICE_REQUIRES_PAID",
      "Esta voz da biblioteca exige plano pago na ElevenLabs. Escolha uma voz pré-definida (premade).",
      "elevenlabs"
    );
  }

  const isQuota =
    status === 402 ||
    code === "quota_exceeded" ||
    code === "payment_required" ||
    message.includes("quota_exceeded") ||
    message.includes("exceeds your quota") ||
    message.includes("credits remaining");

  const isUnusual = code === "detected_unusual_activity" || message.includes("unusual activity");

  if (isQuota || isUnusual) {
    const m = message.match(/you have (\d+) credits remaining/i);
    const remaining = m ? parseInt(m[1], 10) : null;
    const remainingInfo =
      remaining !== null ? ` Restam ${remaining.toLocaleString("pt-BR")} créditos na conta.` : "";

    if (ctx.isUserKey) {
      throw new ApiError(
        402,
        "USER_KEY_QUOTA",
        isUnusual
          ? "A ElevenLabs bloqueou o uso gratuito da sua chave por atividade incomum (ex.: VPN/proxy). Verifique sua conta ou assine um plano."
          : `Sua chave ElevenLabs não tem créditos suficientes para este texto.${remainingInfo}`,
        "elevenlabs"
      );
    }

    if (isUnusual || remaining === null || remaining < 100) {
      markProviderExhausted("elevenlabs", nextResetDate().getTime());
    }
    throw new ApiError(
      402,
      "FREE_LIMIT_REACHED",
      remaining !== null && remaining >= 100
        ? `Os créditos gratuitos do site não são suficientes para este texto.${remainingInfo} Reduza o texto ou use sua própria chave ElevenLabs.`
        : "O limite gratuito de Sonora Voice do site acabou. Cadastre sua própria chave ElevenLabs (é grátis) para continuar.",
      "elevenlabs"
    );
  }

  if (status === 401 || status === 403) {
    if (ctx.isUserKey) {
      throw new ApiError(
        401,
        "USER_KEY_INVALID",
        code === "missing_permissions" || message.includes("missing_permissions")
          ? "Sua chave ElevenLabs não tem as permissões necessárias (Text to Speech e Voices → Read)."
          : "Sua chave ElevenLabs é inválida ou foi revogada. Verifique e cadastre novamente.",
        "elevenlabs"
      );
    }
    if (op === "tts") markProviderExhausted("elevenlabs", nextResetDate().getTime());
    throw new ApiError(
      402,
      "FREE_LIMIT_REACHED",
      "A chave gratuita do site está indisponível no momento. Cadastre sua própria chave ElevenLabs para continuar.",
      "elevenlabs"
    );
  }

  if (status === 404 || code === "voice_not_found") {
    throw new ApiError(404, "NOT_FOUND", "Esta voz não está mais disponível. Escolha outra voz.", "elevenlabs");
  }
  if (status === 429) {
    throw new ApiError(
      429,
      "RATE_LIMIT",
      "A ElevenLabs está recebendo muitas solicitações simultâneas. Aguarde alguns segundos e tente novamente.",
      "elevenlabs",
      10
    );
  }
  if (status === 400 || status === 422) {
    throw new ApiError(
      400,
      "BAD_REQUEST",
      "Não foi possível processar este texto. Verifique o conteúdo e tente novamente.",
      "elevenlabs"
    );
  }
  throw new ApiError(
    502,
    "SERVER_ERROR",
    "O serviço de voz está temporariamente indisponível. Tente novamente em instantes.",
    "elevenlabs"
  );
}
