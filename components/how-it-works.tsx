// ### componente de explicacao passo a passo do fluxo de trabalho da plataforma sonora ###
"use client";

import React from "react";
import { Volume2, Mic, ArrowRight, Sparkles, FileAudio, FileText, CheckCircle2 } from "lucide-react";

// ### passos detalhados para sintese sonora voice ###
const VOICE_STEPS = [
  {
    step: "01",
    tag: "Entrada Criativa",
    title: "Escreva ou Cole o Roteiro",
    desc: "Insira até 10.000 caracteres no editor inteligente com contador em tempo real e sugestões de estilo para YouTube, podcasts ou audiobooks.",
    icon: FileText,
  },
  {
    step: "02",
    tag: "Ajuste Fino",
    title: "Curadoria de Voz e Acústica",
    desc: "Selecione entre dezenas de vozes neurais brasileiras e configure estabilidade, clareza e ritmo de fala para a entonação perfeita.",
    icon: Volume2,
  },
  {
    step: "03",
    tag: "Download Instantâneo",
    title: "Masterização & Áudio MP3",
    desc: "Síntese neural gerada em segundos com waveform interativo, reprodução integrada e download do arquivo MP3 pronto para suas produções.",
    icon: CheckCircle2,
  },
];

// ### passos detalhados para transcricao sonora scribe ###
const SCRIBE_STEPS = [
  {
    step: "01",
    tag: "Upload em Lote",
    title: "Arraste seus Arquivos de Áudio",
    desc: "Envie até 10 arquivos simultâneos em formato MP3, WAV, M4A, OGG ou WebM com detecção instantânea de tamanho e formato.",
    icon: FileAudio,
  },
  {
    step: "02",
    tag: "Motor Groq LPU",
    title: "Processamento Whisper v3 Large",
    desc: "Algoritmo de rede neural processa o áudio em paralelo na Groq com transcrição 100% verbatim, captando termos regionais e jargões sem censura.",
    icon: Mic,
  },
  {
    step: "03",
    tag: "Exportação Inteligente",
    title: "Download TXT Consolidado",
    desc: "Download automático imediato de arquivo .txt único estruturado com timestamps por segmento de fala, resumo de lote e metadados detalhados.",
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    // ### secao como funciona com estilo futurista e conectores visuais ###
    <section id="como-funciona" className="py-20 md:py-28 relative border-t border-white/5">
      <div className="container-app space-y-20">
        {/* ### cabecalho da secao ### */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] text-slate-300 border border-white/10 text-xs font-semibold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Workflow Intuitivo</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Como o ecossistema <span className="gradient-text">Sonora funciona</span>
          </h2>
          <p className="text-base text-slate-400">
            Do roteiro ao áudio final, e da gravação ao texto verbatim: um ciclo de produção sonoro completo em três passos simples.
          </p>
        </div>

        {/* ### fluxo sonora voice (texto para voz) ### */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 text-violet-300 flex items-center justify-center border border-violet-500/30 shadow-lg shadow-violet-900/20">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  Sonora Voice
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                    Text-to-Speech
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Transformação de roteiros em locução natural hiper-realista</p>
              </div>
            </div>
            <a
              href="#estudio"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>Testar Sonora Voice</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {VOICE_STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="card-glass p-7 rounded-2xl border border-violet-500/15 hover:border-violet-500/35 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-violet-400/25 font-mono group-hover:text-violet-400/40 transition-colors">
                      {s.step}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-violet-500/10 text-violet-300 border border-violet-500/20">
                      {s.tag}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-300 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-violet-200 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ### fluxo sonora scribe (voz para texto) ### */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-900/20">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white flex items-center gap-2">
                  Sonora Scribe
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                    Speech-to-Text em Lote
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Transcrição em escala com máxima fidelidade e precisão fonética</p>
              </div>
            </div>
            <a
              href="#estudio"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>Testar Sonora Scribe</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {SCRIBE_STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={idx}
                  className="card-glass p-7 rounded-2xl border border-amber-500/15 hover:border-amber-500/35 transition-all group relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-amber-400/25 font-mono group-hover:text-amber-400/40 transition-colors">
                      {s.step}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {s.tag}
                    </span>
                  </div>

                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-300 mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>

                  <h4 className="text-lg font-bold text-white mb-2 group-hover:text-amber-200 transition-colors">
                    {s.title}
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
