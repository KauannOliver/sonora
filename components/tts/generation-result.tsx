"use client";

import React from "react";
import { AudioPlayer } from "./audio-player";
import { Download, RefreshCw, CheckCircle, Sparkles } from "lucide-react";
import { generateAudioFilename } from "@/lib/utils";

interface GenerationResultProps {
  audioUrl: string;
  voiceName: string;
  characterCount: number;
  onGenerateAgain: () => void;
}

export function GenerationResult({
  audioUrl,
  voiceName,
  characterCount,
  onGenerateAgain,
}: GenerationResultProps) {
  const handleDownload = () => {
    const filename = generateAudioFilename();
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 pt-8 border-t border-white/10 animate-slide-up">
      <div className="glass rounded-3xl p-6 sm:p-7 border border-white/10 shadow-xl bg-ink-900/60">
        {/* Header com badge de sucesso */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Seu áudio está pronto!
              </h3>
              <p className="text-xs text-slate-400">
                Geração concluída com sucesso via ElevenLabs Multilingual v2
              </p>
            </div>
          </div>

          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            44.1 kHz / 128 kbps MP3
          </span>
        </div>

        {/* Player personalizado */}
        <AudioPlayer src={audioUrl} />

        {/* Metadados */}
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 px-4 rounded-xl border border-white/5 bg-white/[0.02] text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Voz</span>
            <span className="font-semibold text-slate-200 truncate block">{voiceName}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Caracteres</span>
            <span className="font-semibold text-slate-200">
              {characterCount.toLocaleString("pt-BR")}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Formato</span>
            <span className="font-semibold text-slate-200">MP3</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[11px]">Qualidade</span>
            <span className="font-semibold text-slate-200">128 kbps</span>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onGenerateAgain}
            className="btn-secondary w-full sm:w-auto text-sm"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Gerar novamente</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="btn-success w-full sm:w-auto text-sm"
          >
            <Download className="w-4 h-4" />
            <span>Baixar arquivo MP3</span>
          </button>
        </div>
      </div>
    </div>
  );
}
