import { NextResponse } from "next/server";
import { getUsage } from "@/lib/server/quota";
import { getClientId } from "@/lib/server/request";

export const dynamic = "force-dynamic";

/** Retorna o consumo da cota gratuita do visitante atual. */
export async function GET(req: Request) {
  return NextResponse.json(getUsage(getClientId(req)), {
    headers: { "Cache-Control": "no-store" },
  });
}
