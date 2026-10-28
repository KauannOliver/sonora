// ### gerenciador em memoria de cotas gratuitas e controle de esgotamento de provedores ###
import type { Provider, QuotaInfo, UsageResponse } from "@/types/api";

export type Service = "tts" | "transcribe";

const SERVICE_PROVIDER: Record<Service, Provider> = {
  tts: "elevenlabs",
  transcribe: "groq",
};

interface VisitorUsage {
  day: string;
  tts: number;
  transcribe: number;
}

interface QuotaStore {
  visitors: Map<string, VisitorUsage>;
  exhausted: Partial<Record<Provider, number>>;
}

const g = globalThis as unknown as { __sonoraQuota?: QuotaStore };
const store: QuotaStore = g.__sonoraQuota ?? { visitors: new Map(), exhausted: {} };
g.__sonoraQuota = store;

// ### leitura segura de variaveis de ambiente com valor padrao ###
function readLimit(envName: string, fallback: number): number {
  const n = Number(process.env[envName]);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

// ### limites diarios gratuitos do portal sonora por visitante ###
export function getLimits(): Record<Service, number> {
  return {
    tts: readLimit("FREE_TTS_CHARS_PER_DAY", 1000),
    transcribe: readLimit("FREE_TRANSCRIPTIONS_PER_DAY", 10),
  };
}

// ### data atual em formato iso yyyy-mm-dd ###
function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// ### calcula a proxima virada de dia em utc para renovar cotas ###
export function nextResetDate(): Date {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d;
}

// ### recupera ou inicializa a contagem de uso do visitante no dia ###
function getVisitor(clientId: string): VisitorUsage {
  const day = today();
  let v = store.visitors.get(clientId);
  if (!v || v.day !== day) {
    v = { day, tts: 0, transcribe: 0 };
    store.visitors.set(clientId, v);
  }

  // ### limpeza periodica de registros antigos para prevencao de vazamento de memoria ###
  if (store.visitors.size > 5000) {
    for (const [id, usage] of store.visitors) {
      if (usage.day !== day) store.visitors.delete(id);
    }
  }
  return v;
}

// ### verifica se a chave integrada do site esta temporariamente esgotada ###
export function isProviderExhausted(provider: Provider): boolean {
  const until = store.exhausted[provider];
  if (!until) return false;
  if (Date.now() >= until) {
    delete store.exhausted[provider];
    return false;
  }
  return true;
}

// ### calcula os segundos restantes de bloqueio temporario ###
export function providerExhaustedSecondsLeft(provider: Provider): number | undefined {
  const until = store.exhausted[provider];
  if (!until) return undefined;
  return Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

// ### marca um provedor como esgotado ate data especificada ###
export function markProviderExhausted(provider: Provider, untilMs: number) {
  store.exhausted[provider] = untilMs;
  console.warn(`[Quota] Chave padrão de ${provider} marcada como esgotada até ${new Date(untilMs).toISOString()}`);
}

// ### limpa o status de esgotamento de um provedor ###
export function clearProviderExhausted(provider: Provider) {
  delete store.exhausted[provider];
}

// ### retorna as informacoes de cota atualizadas para um servico especifico ###
export function getQuota(clientId: string, service: Service): QuotaInfo {
  const limit = getLimits()[service];
  const used = getVisitor(clientId)[service];
  return {
    used,
    limit,
    remaining: Math.max(0, limit - used),
    providerExhausted: isProviderExhausted(SERVICE_PROVIDER[service]),
  };
}

// ### computa o consumo de caracteres ou transcricoes do visitante ###
export function consumeQuota(clientId: string, service: Service, amount: number) {
  const v = getVisitor(clientId);
  v[service] += amount;
}

// ### consolida o relatorio de uso para resposta da rota de consumo ###
export function getUsage(clientId: string): UsageResponse {
  return {
    tts: getQuota(clientId, "tts"),
    transcribe: getQuota(clientId, "transcribe"),
    resetsAt: nextResetDate().toISOString(),
  };
}
