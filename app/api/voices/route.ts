import { NextResponse } from "next/server";
import { fetchVoices } from "@/lib/server/elevenlabs";
import { ApiError, toErrorResponse } from "@/lib/server/errors";
import { getDefaultElevenLabsKey } from "@/lib/server/keys";
import { getUserKey } from "@/lib/server/request";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const userKey = getUserKey(req, "elevenlabs");
    const apiKey = userKey ?? getDefaultElevenLabsKey();
    if (!apiKey) {
      throw new ApiError(
        402,
        "FREE_LIMIT_REACHED",
        "Este site não possui uma chave ElevenLabs padrão configurada. Cadastre sua própria chave para continuar.",
        "elevenlabs"
      );
    }

    const data = await fetchVoices({ apiKey, isUserKey: !!userKey });
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    return toErrorResponse(err, "elevenlabs", "API Voices");
  }
}
