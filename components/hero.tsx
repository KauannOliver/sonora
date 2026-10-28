"use client";

// ### importação de dependências react e utilitários ###
import React from "react";
import { scrollToId } from "@/lib/utils";
import { useApiKeys } from "./api-keys/api-keys-context";
import { PRODUCT_TTS, PRODUCT_STT } from "@/lib/constants";
import {
  Volume2,
  Mic,
  Sparkles,
  Zap,
  Key,
  ShieldCheck,
  ArrowRight,
  Play,
  FileText,
  Clock,
  CheckCircle2,
} from "lucide-react";

export function Hero() {
  const { openModal } = useApiKeys();

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-acoustic-grid">
      {/* ### orbs de luz ambiente com desfoque profundo ### */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-violet-600/25 via-fuchsia-600/20 to-orange-500/15 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-72 h-72 bg-cyan-500/10 blur-[100px] rounded-full pointer-events-none" />

      <div className="container-app relative text-center">
        {/* ### badge de novidade com borda luminosa ### */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-xs font-semibold text-violet-300 mb-8 shadow-[0_0_20px_rgba(124,58,237,0.25)] animate-fade-in">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Ecossistema Unificado de Áudio & Fala com IA</span>
        </div>

        {/* ### título de grande impacto tipográfico ### */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.08] max-w-4xl mx-auto font-display">
          A nova dimensão da <span className="gradient-sonora">voz humana</span> e da transcrição neural
        </h1>

        {/* ### descrição clara da proposta de valor dos dois produtos ### */}
        <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-300/90 max-w-2xl mx-auto leading-relaxed font-light">
          Sintetize falas ultra-expressivas com o <strong>{PRODUCT_TTS}</strong> e transcreva múltiplos áudios em segundos com o <strong>{PRODUCT_STT}</strong>. Sem limites, 100% fiel ao Português do Brasil e com download automático.
        </p>

        {/* ### botões de cta primários para salto rápido aos estúdios ### */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
          <button
            type="button"
            onClick={() => scrollToId("estudio-voice")}
            className="btn-primary w-full sm:w-auto text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            <span>Sintetizar Voz (TTS)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => scrollToId("estudio-scribe")}
            className="btn-scribe w-full sm:w-auto text-sm py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2"
          >
            <Mic className="w-4 h-4" />
            <span>Transcrever Áudios (STT)</span>
          </button>
        </div>

        {/* ### showcase interativo dos dois produtos em cards de alta fidelidade ### */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
          {/* ### card demonstrativo do sonora voice ### */}
          <div
            onClick={() => scrollToId("estudio-voice")}
            className="glass-card p-6 sm:p-7 border border-violet-500/25 hover:border-violet-500/60 hover:shadow-glow transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-violet-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-violet-500/15 text-violet-300 flex items-center justify-center border border-violet-500/30">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg group-hover:text-violet-300 transition-colors">
                    {PRODUCT_TTS}
                  </h3>
                  <span className="text-xs text-slate-400">Motor Neural ElevenLabs v2</span>
                </div>
              </div>

              <span className="chip text-[11px] text-violet-300 border-violet-500/30 bg-violet-500/10">
                Texto → MP3
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Transforme roteiros, artigos e falas em áudios cristalinos em Português do Brasil com entonação humana impecável, ritmo e expressividade natural.
            </p>

            {/* ### simulador visual do player do sonora voice ### */}
            <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
                  <span className="text-slate-300 font-medium">Preview de Síntese</span>
                </div>
                <span className="font-mono text-slate-400 text-[11px]">44.1 kHz • 128 kbps</span>
              </div>

              {/* ### barras de waveform dinâmicas ### */}
              <div className="flex items-center justify-between gap-1 h-9 px-2 bg-obsidian-950/80 rounded-xl">
                {Array.from({ length: 28 }).map((_, i) => {
                  const h = Math.sin(i * 0.4) * 14 + 16;
                  return (
                    <div
                      key={i}
                      style={{ height: `${h}px` }}
                      className="w-1 rounded-full bg-gradient-to-t from-violet-600 to-fuchsia-400 opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Voz: Charlie (PT-BR)</span>
                <span className="text-violet-400 font-semibold group-hover:underline flex items-center gap-1">
                  <span>Abrir no estúdio</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>

          {/* ### card demonstrativo do sonora scribe ### */}
          <div
            onClick={() => scrollToId("estudio-scribe")}
            className="glass-card p-6 sm:p-7 border border-orange-500/25 hover:border-orange-500/60 hover:shadow-glow-orange transition-all duration-300 cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-600/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-500/15 text-orange-300 flex items-center justify-center border border-orange-500/30">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg group-hover:text-orange-300 transition-colors">
                    {PRODUCT_STT}
                  </h3>
                  <span className="text-xs text-slate-400">Groq LPU + Whisper Large V3</span>
                </div>
              </div>

              <span className="chip text-[11px] text-orange-300 border-orange-500/30 bg-orange-500/10">
                Áudio → TXT
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-5">
              Transcreva até 10 arquivos simultâneos em segundos. Captura verbatim rigorosa com gírias, linguagem coloquial e palavrões sem censura.
            </p>

            {/* ### simulador visual do console do sonora scribe ### */}
            <div className="p-4 rounded-2xl bg-obsidian-900/90 border border-white/5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-slate-300 font-medium">Lote em Tempo Real</span>
                </div>
                <span className="font-mono text-orange-400 font-bold text-[11px]">100% Verbatim</span>
              </div>

              <div className="p-2.5 rounded-xl bg-obsidian-950/80 font-mono text-[11px] text-slate-300 space-y-1 border border-white/5">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="truncate">audio_podcast_01.mp3</span>
                  <span className="text-emerald-400 font-semibold">1.42s ✓</span>
                </div>
                <p className="text-[10px] text-slate-400 truncate italic">
                  &ldquo;Aí a gente começou a gravar e o cara falou tudo direto...&rdquo;
                </p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span>Download consolidado em .txt</span>
                <span className="text-orange-400 font-semibold group-hover:underline flex items-center gap-1">
                  <span>Abrir no estúdio</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ### métricas de performance e confiança ### */}
        <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-display block">
              &lt; 1.5s
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">Velocidade Groq LPU</span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-display block">
              100%
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">Verbatim Sem Censura</span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-violet-400 font-display block">
              21+
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">Vozes Calibradas em PT-BR</span>
          </div>

          <div>
            <span className="text-2xl sm:text-3xl font-extrabold text-orange-400 font-display block">
              Zero
            </span>
            <span className="text-xs text-slate-400 mt-0.5 block">Retenção de Dados em Servidor</span>
          </div>
        </div>
      </div>
    </section>
  );
}
