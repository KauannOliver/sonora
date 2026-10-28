"use client";

// ### importação de dependências react e ícones lucide ###
import React from "react";
import { scrollToId } from "@/lib/utils";
import { PRODUCT_TTS, PRODUCT_STT } from "@/lib/constants";
import {
  Volume2,
  Mic,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  Headphones,
  Video,
  FileCheck,
  Scale,
  GraduationCap,
  Megaphone,
} from "lucide-react";

export function ProductsShowcase() {
  const ttsCapabilities = [
    "Narração ultra-expressiva para vídeos do YouTube, Reels e TikTok",
    "Geração de áudio para podcasts e episódios informativos",
    "Ajustes de velocidade de 0.7x a 1.2x sem distorção tonal",
    "Controle fino de similaridade de voz e exagero estilístico",
    "Download direto em MP3 com qualidade de broadcast (128 kbps / 44.1 kHz)",
    "Histórico de rascunhos e áudios salvos localmente no navegador",
  ];

  const sttCapabilities = [
    "Processamento em lote de até 10 arquivos simultâneos em segundos",
    "100% Verbatim em PT-BR: captura gírias, interjeições e palavrões sem censura",
    "Download automático de arquivo .txt consolidado estruturado",
    "Separação de fala por minutagem e timestamps precisos [MM:SS]",
    "Suporte a múltiplos formatos: MP3, WAV, M4A, OGG, WEBM e FLAC",
    "Aceleração por hardware Groq LPU de altíssimo throughput",
  ];

  const useCases = [
    {
      icon: Video,
      title: "Criadores de Conteúdo",
      desc: "Transforme roteiros em narrações prontas para seus vídeos e transcreva entrevistas e cortes sem perda de tempo.",
    },
    {
      icon: Headphones,
      title: "Podcasters & Mídia",
      desc: "Gere vinhetas sonoras profissionais e obtenha a transcrição literal completa dos episódios gravados.",
    },
    {
      icon: Scale,
      title: "Jurídico & Compliance",
      desc: "Transcreva depoimentos, atas e audiências com fidelidade verbatim absoluta sem nenhuma censura ou omissão.",
    },
    {
      icon: GraduationCap,
      title: "Pesquisa & Educação",
      desc: "Transforme artigos e livros em áudio para estudos, e transcreva aulas, palestras e entrevistas qualitativas.",
    },
  ];

  return (
    <section id="produtos" className="py-20 md:py-28 relative border-t border-white/[0.08]">
      <div className="container-app space-y-20">
        {/* ### cabeçalho da seção de produtos ### */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <span className="chip text-xs font-semibold text-violet-300 border-violet-500/30 bg-violet-500/10">
            A Suíte Completa
          </span>
          <h2 className="section-title font-display">
            Dois produtos desenhados para dominar o som
          </h2>
          <p className="section-subtitle">
            Conheça a fundo os recursos e as capacidades do <strong>{PRODUCT_TTS}</strong> e do <strong>{PRODUCT_STT}</strong>.
          </p>
        </div>

        {/* ### comparativo detalhado lado a lado dos dois motores ### */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ### bloco sonora voice ### */}
          <div className="glass-card p-8 sm:p-10 border border-violet-500/20 flex flex-col justify-between space-y-8 relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-grad-voice flex items-center justify-center text-white shadow-glow">
                    <Volume2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white font-display">
                      {PRODUCT_TTS}
                    </h3>
                    <span className="text-xs text-violet-300 font-medium">
                      Síntese Neural de Fala Humana
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-300">
                  ElevenLabs v2
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                O estado da arte em inteligência artificial para síntese vocal. Desenvolvido para capturar as inflexões emocionais, pausas e cadências naturais de falantes nativos do Português do Brasil.
              </p>

              {/* ### lista de capacidades do sonora voice ### */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  O que você pode fazer:
                </span>
                <ul className="space-y-2.5">
                  {ttsCapabilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <div className="w-4 h-4 rounded-full bg-violet-500/20 text-violet-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => scrollToId("estudio-voice")}
                className="btn-primary w-full text-sm py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                <span>Abrir Estúdio {PRODUCT_TTS}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ### bloco sonora scribe ### */}
          <div className="glass-card p-8 sm:p-10 border border-orange-500/20 flex flex-col justify-between space-y-8 relative overflow-hidden">
            <div className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-grad-scribe flex items-center justify-center text-white shadow-glow-orange">
                    <Mic className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-extrabold text-white font-display">
                      {PRODUCT_STT}
                    </h3>
                    <span className="text-xs text-orange-300 font-medium">
                      Transcrição Neural em Lote
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300">
                  Whisper Large V3
                </span>
              </div>

              <p className="text-sm text-slate-300 leading-relaxed">
                Velocidade revolucionária de processamento acústico alimentado pela arquitetura Groq LPU. Transcreve arquivos de áudio em segundos com fidelidade literal absoluta sem nenhuma censura.
              </p>

              {/* ### lista de capacidades do sonora scribe ### */}
              <div className="space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  O que você pode fazer:
                </span>
                <ul className="space-y-2.5">
                  {sttCapabilities.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                      <div className="w-4 h-4 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => scrollToId("estudio-scribe")}
                className="btn-scribe w-full text-sm py-3.5 rounded-xl flex items-center justify-center gap-2"
              >
                <span>Abrir Estúdio {PRODUCT_STT}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ### grade de casos de uso por público ### */}
        <div className="space-y-8 pt-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-2xl font-bold text-white font-display">
              Desenvolvido para fluxos de trabalho reais
            </h3>
            <p className="text-xs sm:text-sm text-slate-400">
              Veja como profissionais e criadores utilizam o Sonora no dia a dia.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {useCases.map((uc, idx) => {
              const Icon = uc.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 border border-white/5 hover:border-white/15 space-y-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.05] text-violet-400 flex items-center justify-center border border-white/10">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-base font-display">
                    {uc.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {uc.desc}
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
