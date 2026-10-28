// ### componente de rodape institucional da plataforma sonora ###
"use client";

import React from "react";
import { AudioWaveform, Key, ExternalLink, ShieldCheck, Sparkles, Heart } from "lucide-react";
import { scrollToId } from "@/lib/utils";
import { useApiKeys } from "./api-keys/api-keys-context";

export function Footer() {
  const { openModal } = useApiKeys();

  return (
    // ### rodape com grid e informacoes de tecnologia e privacidade ###
    <footer className="border-t border-white/10 bg-black/60 backdrop-blur-xl py-14 text-slate-400 text-xs relative">
      <div className="container-app space-y-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* ### logotipo sonora e descricao de proposito ### */}
          <div className="space-y-3 max-w-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-glow-sm">
                <AudioWaveform className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-white text-xl tracking-tight">
                Sonora<span className="gradient-text">.ai</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma neural de áudio de alta precisão. Síntese hiper-realista e transcrição em lote verbatim otimizada para o Português do Brasil.
            </p>
          </div>

          {/* ### links rapidos para navegacao e produtos ### */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs">
            <button
              type="button"
              onClick={() => scrollToId("produtos")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Produtos
            </button>
            <button
              type="button"
              onClick={() => scrollToId("estudio")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Sonora Studio
            </button>
            <button
              type="button"
              onClick={() => scrollToId("recursos")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Recursos
            </button>
            <button
              type="button"
              onClick={() => scrollToId("como-funciona")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              Como Funciona
            </button>
            <button
              type="button"
              onClick={() => scrollToId("faq")}
              className="text-slate-300 hover:text-white transition-colors"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => openModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-300 hover:bg-violet-500/20 transition-all font-semibold"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Gerenciar Chaves</span>
            </button>
          </div>
        </div>

        {/* ### divisor e metadados de protecao e tecnologias ### */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>
            Sonora AI &copy; {new Date().getFullYear()} • Infraestrutura neural com <strong>ElevenLabs Multilingual v2</strong> & <strong>Groq Whisper Large v3</strong>.
          </p>

          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zero-Storage Server: privacidade nativa</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
