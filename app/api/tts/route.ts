// ### rota de api para sintese neural de voz com elevenlabs multilingual v2 ###
import { synthesize } from "@/lib/server/elevenlabs";
import { ApiError, toErrorResponse } from "@/lib/server/errors";
import { getDefaultElevenLabsKey } from "@/lib/server/keys";
import { consumeQuota, getQuota, isProviderExhausted } from "@/lib/server/quota";
import { enforceRateLimit, getClientId, getUserKey } from "@/lib/server/request";
import { generateAudioFilename } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const clientId = getClientId(req);
    const userKey = getUserKey(req, "elevenlabs");

    // ### limite de requisicoes simultaneas para protecao ###
    enforceRateLimit(`tts:${clientId}`, userKey ? 30 : 10);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let body: any;
    try {
      body = await req.json();
    } catch {
      throw new ApiError(400, "BAD_REQUEST", "Formato de requisição inválido.");
    }

    const { text, voiceId, voiceSettings } = body ?? {};
    if (!text || typeof text !== "string" || !text.trim()) {
      throw new ApiError(400, "BAD_REQUEST", "O texto para geração é obrigatório.");
    }
    if (!voiceId || typeof voiceId !== "string") {
      throw new ApiError(400, "BAD_REQUEST", "Selecione uma voz para continuar.");
    }

    const chars = text.trim().length;
    let apiKey = userKey;

    // ### sem chave pessoal: usa a chave padrao do sonora com respeito a cota gratuita ###
    if (!apiKey) {
      apiKey = getDefaultElevenLabsKey();
      if (!apiKey || isProviderExhausted("elevenlabs")) {
        throw new ApiError(
          402,
          "FREE_LIMIT_REACHED",
          "O limite gratuito de Sonora Voice do site acabou. Cadastre sua própria chave ElevenLabs (é grátis) para continuar.",
          "elevenlabs"
        );
      }

      const quota = getQuota(clientId, "tts");
      if (chars > quota.remaining) {
        throw new ApiError(
          402,
          "FREE_LIMIT_REACHED",
          quota.remaining === 0
            ? `Você já usou os ${quota.limit.toLocaleString("pt-BR")} caracteres gratuitos de hoje. Cadastre sua própria chave ElevenLabs para continuar.`
            : `Este texto tem ${chars.toLocaleString("pt-BR")} caracteres, mas restam ${quota.remaining.toLocaleString(
                "pt-BR"
              )} caracteres gratuitos hoje. Reduza o texto ou cadastre sua própria chave ElevenLabs.`,
          "elevenlabs"
        );
      }
    }

    const audio = await synthesize({ apiKey, isUserKey: !!userKey }, { text, voiceId, voiceSettings });

    const headers: Record<string, string> = {
      "Content-Type": "audio/mpeg",
      "Content-Disposition": `inline; filename="${generateAudioFilename()}"`,
      "Content-Length": audio.byteLength.toString(),
      "Cache-Control": "no-store",
    };

    if (!userKey) {
      consumeQuota(clientId, "tts", chars);
      headers["X-Free-Remaining"] = String(getQuota(clientId, "tts").remaining);
    }

    return new Response(audio, { status: 200, headers });
  } catch (err) {
    return toErrorResponse(err, "elevenlabs", "API TTS");
  }
}
