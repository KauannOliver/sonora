// ### componente de faixa de notificacao da cota de uso do portal sonora ###
"use client";

import React from "react";
import { useApiKeys } from "./api-keys-context";
import type { Provider } from "@/types/api";
import { Sparkles, Key, AlertTriangle, CheckCircle2 } from "lucide-react";

interface QuotaBannerProps {
  provider: Provider;
}

export function QuotaBanner({ provider }: QuotaBannerProps) {
  const { hasKey, usage, openModal } = useApiKeys();

  const isCustom = hasKey(provider);
  const quota = provider === "elevenlabs" ? usage?.tts : usage?.transcribe;

  // ### estado com chave propria ativada pelo usuario ###
  if (isCustom) {
    return (
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-emerald-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>
            <strong>Sua chave própria de {provider === "elevenlabs" ? "ElevenLabs" : "Groq"} está ativa:</strong> você tem uso ilimitado direto na sua conta.
          </span>
        </div>
        <button
          type="button"
          onClick={() => openModal(provider)}
          className="underline hover:text-white transition-colors text-[11px] font-medium flex-shrink-0"
        >
          Gerenciar
        </button>
      </div>
    );
  }

  // ### sem dados de cota disponiveis ainda ###
  if (!quota) {
    return null;
  }

  const isExhausted = quota.remaining <= 0 || quota.providerExhausted;
  const isLow = quota.remaining > 0 && quota.remaining <= (provider === "elevenlabs" ? 250 : 2);

  // ### aviso de cota gratuita do dia esgotada ###
  if (isExhausted) {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-amber-200 animate-fade-in">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Limite gratuito diário atingido:</strong> insira sua chave gratuita de {provider === "elevenlabs" ? "ElevenLabs" : "Groq"} para continuar usando o Sonora sem interrupções.
          </span>
        </div>
        <button
          type="button"
          onClick={() =>
            openModal(
              provider,
              `O limite gratuito diário de ${
                provider === "elevenlabs" ? "Sonora Voice (TTS)" : "Sonora Scribe (STT)"
              } do site acabou hoje. Insira sua chave para continuar.`
            )
          }
          className="btn-primary btn-sm flex-shrink-0 text-xs py-1.5 px-3.5 inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Adicionar chave grátis</span>
        </button>
      </div>
    );
  }

  // ### banner informando saldo restante da cota gratuita ###
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 py-2 rounded-xl border border-white/5 bg-white/[0.02] text-xs text-slate-400">
      <div className="flex items-center gap-2 flex-wrap">
        <Sparkles className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
        <span>
          Cota Gratuita Sonora:{" "}
          <strong className="text-slate-200">
            {provider === "elevenlabs"
              ? `${quota.remaining.toLocaleString("pt-BR")} caracteres restantes hoje`
              : `${quota.remaining} transcrições restantes hoje`}
          </strong>{" "}
          (de {provider === "elevenlabs" ? quota.limit.toLocaleString("pt-BR") : quota.limit})
        </span>
        {isLow && (
          <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
            Quase no fim
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => openModal(provider)}
        className="inline-flex items-center gap-1 text-[11px] text-violet-300 hover:text-violet-200 hover:underline transition-colors flex-shrink-0"
      >
        <Key className="w-3 h-3" />
        <span>Usar minha própria chave</span>
      </button>
    </div>
  );
}
