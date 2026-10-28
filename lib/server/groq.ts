// ### cliente e servico de integracao com a api da groq whisper large v3 ###
import { TRANSCRIBE_CONFIG } from "@/lib/constants";
import type { TranscriptionResult } from "@/types/transcription";
import { ApiError } from "./errors";
import { clearProviderExhausted, markProviderExhausted } from "./quota";
import type { NamedKey } from "./keys";

const GROQ_TRANSCRIBE_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const GROQ_MODELS_URL = "https://api.groq.com/openai/v1/models";

// ### extrai o tempo de espera do header retry-after ou do texto de resposta ###
function parseRetryAfter(header: string | null, message: string): number | undefined {
  const fromHeader = header ? Number(header) : NaN;
  if (Number.isFinite(fromHeader) && fromHeader > 0) return fromHeader;

  const m = message.match(/try again in\s+(?:(\d+)h)?(?:(\d+)m)?(?:([\d.]+)s)?/i);
  if (m && (m[1] || m[2] || m[3])) {
    return (Number(m[1] || 0) * 3600) + (Number(m[2] || 0) * 60) + Math.ceil(Number(m[3] || 0));
  }
  return undefined;
}

// ### formata tempo de espera em texto legivel para o usuario ###
function humanWait(seconds?: number): string {
  if (!seconds) return "alguns instantes";
  if (seconds < 60) return `${Math.ceil(seconds)}s`;
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} min`;
  return `${(seconds / 3600).toFixed(1)} h`;
}

// ### transcreve arquivo com groq whisper v3 large e failover automatico entre chaves ###
export async function transcribeWithGroq(
  file: File,
  keys: NamedKey[],
  isUserKey: boolean
): Promise<TranscriptionResult> {
  let lastRetryAfter: number | undefined;
  let lastMessage = "";
  let keyLimited = false;

  for (let i = 0; i < keys.length; i++) {
    const current = keys[i];
    const form = new FormData();
    form.append("file", file, file.name);
    form.append("model", TRANSCRIBE_CONFIG.model);
    form.append("language", TRANSCRIBE_CONFIG.language);
    form.append("temperature", String(TRANSCRIBE_CONFIG.temperature));
    form.append("response_format", TRANSCRIBE_CONFIG.responseFormat);
    form.append("prompt", TRANSCRIBE_CONFIG.prompt);

    const started = Date.now();
    let res: Response;
    try {
      res = await fetch(GROQ_TRANSCRIBE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${current.key}` },
        body: form,
      });
    } catch (err) {
      lastMessage = (err as Error).message;
      console.warn(`[Groq] Erro de rede com ${current.name}: ${lastMessage}`);
      continue; // ### failover: tenta a proxima chave configurada ###
    }

    if (res.ok) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await res.json();
      if (!isUserKey) clearProviderExhausted("groq");
      return {
        filename: file.name,
        filesize: file.size,
        duration: data.duration ?? null,
        language: data.language || "pt",
        text: String(data.text || "").trim(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        segments: Array.isArray(data.segments)
          ? data.segments.map((s: any) => ({ id: s.id, start: s.start, end: s.end, text: s.text }))
          : [],
        elapsedSeconds: ((Date.now() - started) / 1000).toFixed(2),
        keyUsed: isUserKey ? "Sua chave Groq" : current.name,
        timestamp: new Date().toISOString(),
      };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const body: any = await res.json().catch(() => ({}));
    const msg: string = body?.error?.message || `HTTP ${res.status}`;
    lastMessage = msg;
    console.warn(`[Groq] HTTP ${res.status} com ${current.name}: ${msg}`);

    if (res.status === 429) {
      keyLimited = true;
      lastRetryAfter = parseRetryAfter(res.headers.get("retry-after"), msg);
      continue; // ### failover para a chave reserva ###
    }

    if (res.status === 401 || res.status === 403) {
      if (isUserKey) {
        throw new ApiError(
          401,
          "USER_KEY_INVALID",
          "Sua chave Groq é inválida ou foi revogada. Verifique e cadastre novamente.",
          "groq"
        );
      }
      keyLimited = true;
      continue; // ### chave padrao com erro: tenta a chave de contingencia ###
    }

    if (res.status === 413) {
      throw new ApiError(413, "BAD_REQUEST", "O arquivo excede o limite de 25 MB aceito pela Groq.", "groq");
    }

    if (res.status === 400 || res.status === 422) {
      throw new ApiError(400, "BAD_REQUEST", `A Groq não conseguiu processar este áudio: ${msg}`, "groq");
    }

    throw new ApiError(502, "SERVER_ERROR", `Erro na API da Groq: ${msg}`, "groq");
  }

  // ### todas as chaves falharam ou esgotaram cotas ###
  const wait = lastRetryAfter;
  if (isUserKey && keyLimited) {
    throw new ApiError(
      429,
      "USER_KEY_QUOTA",
      `Sua chave Groq atingiu o limite de uso. Tente novamente em ${humanWait(wait)}.`,
      "groq",
      wait
    );
  }

  if (!isUserKey && (keyLimited || keys.length === 0)) {
    const cooldown = Math.max(wait ?? 60, 30);
    markProviderExhausted("groq", Date.now() + cooldown * 1000);
    throw new ApiError(
      429,
      "FREE_LIMIT_REACHED",
      `O limite gratuito de Sonora Scribe do site foi atingido (libera em ~${humanWait(
        cooldown
      )}). Cadastre sua própria chave Groq (é grátis) para continuar agora.`,
      "groq",
      cooldown
    );
  }

  throw new ApiError(502, "SERVER_ERROR", "Não foi possível transcrever o áudio no momento.", "groq");
}

// ### validacao rapida de credenciais groq via listagem de modelos ###
export async function validateGroqKey(apiKey: string): Promise<{ valid: boolean; message: string }> {
  try {
    const res = await fetch(GROQ_MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    });
    if (res.ok) return { valid: true, message: "Chave Groq válida e pronta para uso." };
    if (res.status === 429) return { valid: true, message: "Chave válida (no momento com limite de uso atingido)." };
    return { valid: false, message: "Chave Groq inválida ou revogada." };
  } catch {
    return { valid: false, message: "Não foi possível conectar à Groq para validar a chave." };
  }
}
