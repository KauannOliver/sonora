// ### componente de exibição dos diferenciais e recursos tecnologicos sonora ###
"use client";

import React from "react";
import {
  Zap,
  Volume2,
  FileText,
  Key,
  ShieldCheck,
  Radio,
  Cpu,
  Sparkles,
} from "lucide-react";

// ### lista de diferenciais tecnicos com design moderno e icones tematicos ###
const FEATURES = [
  {
    icon: Zap,
    badge: "Ultrarrápido",
    color: "from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-300",
    glow: "group-hover:shadow-[0_0_30px_rgba(245,158,11,0.2)]",
    title: "Groq LPU + Whisper v3 Large",
    desc: "Aceleração por Language Processing Units da Groq para transcrever horas de áudio em segundos, com precisão quase humana e latência quase nula.",
  },
  {
    icon: Volume2,
    badge: "Hiper-realista",
    color: "from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-300",
    glow: "group-hover:shadow-[0_0_30px_rgba(139,92,246,0.2)]",
    title: "ElevenLabs Multilingual v2",
    desc: "Síntese neural com inteligência de entonação brasileira, pausas naturais, cadência emocional e suporte a dezenas de vozes expressivas.",
  },
  {
    icon: Radio,
    badge: "Fidelidade 100%",
    color: "from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-300",
    glow: "group-hover:shadow-[0_0_30px_rgba(244,63,94,0.2)]",
    title: "Transcrição Verbatim Completa",
    desc: "Preserva cada detalhe fonético: gírias, interjeições regionais brasileiras, gaguejos e hesitações sem autocensura ou filtros de omissão.",
  },
  {
    icon: FileText,
    badge: "Automação",
    color: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-300",
    glow: "group-hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]",
    title: "Exportação Consolidada Inteligente",
    desc: "Gera automaticamente arquivos .txt estruturados contendo cabeçalho temporal, sumário de arquivo, metadados e transcrição dividida por faixas.",
  },
  {
    icon: Key,
    badge: "Flexibilidade",
    color: "from-sky-500/20 to-blue-500/10 border-sky-500/30 text-sky-300",
    glow: "group-hover:shadow-[0_0_30px_rgba(14,165,233,0.2)]",
    title: "Cota Gratuita + Traga sua Chave (BYOK)",
    desc: "Experimente instantaneamente com nossa cota gratuita. Se atingir os limites diários, insira sua chave própria da ElevenLabs ou Groq em 1 clique.",
  },
  {
    icon: ShieldCheck,
    badge: "Segurança Total",
    color: "from-teal-500/20 to-cyan-500/10 border-teal-500/30 text-teal-300",
    glow: "group-hover:shadow-[0_0_30px_rgba(20,184,166,0.2)]",
    title: "Privacidade Zero-Knowledge",
    desc: "Suas chaves pessoais ficam salvas exclusivamente no LocalStorage do seu navegador. Nenhum arquivo de áudio ou texto é retido em banco de dados.",
  },
];

export function Features() {
  return (
    // ### secao principal de recursos tecnologicos com grade responsiva ###
    <section id="recursos" className="py-20 md:py-28 relative border-t border-white/5 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
      <div className="container-app">
        {/* ### cabecalho da secao de diferenciais ### */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide">
            <Cpu className="w-3.5 h-3.5" />
            <span>Infraestrutura Sonora Core</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Engenharia de áudio criada para <span className="gradient-text">velocidade e perfeição</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Integramos o estado da arte de Large Processing Units e Redes Neurais para que você nunca precise escolher entre rapidez e qualidade.
          </p>
        </div>

        {/* ### grade com cards estilizados e efeitos luminosos ### */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className={`group relative card-glass p-7 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 ${feat.glow}`}
              >
                {/* ### efeito de brilho sutil no canto do card ### */}
                <div className="absolute top-0 right-0 w-28 h-28 bg-white/[0.02] rounded-bl-full pointer-events-none group-hover:bg-violet-500/5 transition-colors" />

                <div className="flex items-center justify-between mb-5">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br border flex items-center justify-center ${feat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/[0.04] text-slate-400 border border-white/10 group-hover:border-white/20">
                    {feat.badge}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white group-hover:text-violet-200 transition-colors mb-2">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* ### faixa inferior de confianca e métricas de desempenho ### */}
        <div className="mt-14 p-6 sm:p-8 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-950/20 via-black/40 to-indigo-950/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">Disponibilidade total e processamento paralelo</h4>
              <p className="text-xs sm:text-sm text-slate-400">Failover automático entre chaves para garantir que seu fluxo nunca pare.</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <div className="text-xl sm:text-2xl font-black text-white">99.9%</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Acurácia PT-BR</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-xl sm:text-2xl font-black text-violet-400">&lt; 15s</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Por Áudio de 10 min</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-xl sm:text-2xl font-black text-amber-400">100%</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider">Verbatim Nativo</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
