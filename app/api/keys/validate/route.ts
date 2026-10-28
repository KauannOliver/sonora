import { NextResponse } from "next/server";
import { validateElevenLabsKey } from "@/lib/server/elevenlabs";
import { validateGroqKey } from "@/lib/server/groq";
import { enforceRateLimit, getClientId } from "@/lib/server/request";
import { toErrorResponse } from "@/lib/server/errors";

export const dynamic = "force-dynamic";

/** Valida uma chave informada pelo usuário sem armazená-la. */
export async function POST(req: Request) {
  try {
    enforceRateLimit(`validate:${getClientId(req)}`, 20);

    const body = await req.json().catch(() => ({}));
    const provider = body?.provider;
    const key = typeof body?.key === "string" ? body.key.trim() : "";

    if (!key || key.length < 10 || /\s/.test(key)) {
      return NextResponse.json({ valid: false, message: "Informe uma chave válida." }, { status: 400 });
    }

    if (provider === "elevenlabs") return NextResponse.json(await validateElevenLabsKey(key));
    if (provider === "groq") return NextResponse.json(await validateGroqKey(key));

    return NextResponse.json({ valid: false, message: "Provedor desconhecido." }, { status: 400 });
  } catch (err) {
    return toErrorResponse(err, undefined, "API Validate");
  }
}
