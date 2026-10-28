"use client";

import React, { useState, useRef, useEffect } from "react";
import { VoiceItem } from "@/types/elevenlabs";
import { VoicePreview } from "./voice-preview";
import { Mic2, Search, AlertCircle, RefreshCw, Check } from "lucide-react";

interface VoiceSelectorProps {
  voices: VoiceItem[];
  selectedVoiceId: string;
  onSelectVoice: (voiceId: string) => void;
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasPtBr: boolean;
}

export function VoiceSelector({
  voices,
  selectedVoiceId,
  onSelectVoice,
  isLoading,
  error,
  onRetry,
  hasPtBr,
}: VoiceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlayPreview = (voiceId: string, previewUrl?: string | null) => {
    if (!previewUrl) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(previewUrl);
    audioRef.current = audio;
    setActivePreviewId(voiceId);

    audio.play().catch((err) => {
      console.warn("Erro ao reproduzir preview:", err);
      setActivePreviewId(null);
    });

    audio.onended = () => {
      setActivePreviewId(null);
    };

    audio.onerror = () => {
      setActivePreviewId(null);
    };
  };

  const handleStopPreview = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActivePreviewId(null);
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const filteredVoices = voices.filter((voice) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = voice.name.toLowerCase().includes(term);
    const descMatch = (voice.description || "").toLowerCase().includes(term);
    const categoryMatch = (voice.category || "").toLowerCase().includes(term);
    const accentMatch = (voice.accent || "").toLowerCase().includes(term);
    return nameMatch || descMatch || categoryMatch || accentMatch;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="label">
          <Mic2 className="w-4 h-4 text-violet-400" />
          <span>Escolha a voz da IA</span>
          {voices.length > 0 && (
            <span className="text-xs font-normal text-slate-400">
              ({voices.length} disponíveis)
            </span>
          )}
        </label>

        {voices.length > 4 && (
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome ou estilo..."
              className="input pl-8 pr-3 py-1.5 text-xs w-full sm:w-56"
            />
          </div>
        )}
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl border border-white/5 bg-white/[0.02] p-4 flex flex-col justify-between"
            >
              <div className="h-4 bg-white/10 rounded w-2/3" />
              <div className="h-3 bg-white/5 rounded w-1/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="btn-danger btn-sm inline-flex items-center gap-1.5 self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar novamente</span>
          </button>
        </div>
      )}

      {!isLoading && !error && !hasPtBr && voices.length > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
          <span>
            Nenhuma voz explicitamente marcada como PT-BR foi retornada da biblioteca. Você ainda pode usar qualquer voz disponível com o modelo Multilingual v2.
          </span>
        </div>
      )}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
          {filteredVoices.map((voice) => {
            const isSelected = voice.voiceId === selectedVoiceId;
            const isPlaying = activePreviewId === voice.voiceId;

            return (
              <div
                key={voice.voiceId}
                onClick={() => onSelectVoice(voice.voiceId)}
                className={`cursor-pointer rounded-2xl p-4 border transition-all text-left flex flex-col justify-between ${
                  isSelected
                    ? "bg-violet-500/10 border-violet-500/60 shadow-glow-sm ring-1 ring-violet-500/40"
                    : "bg-white/[0.03] border-white/5 hover:border-white/15 hover:bg-white/[0.05]"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-white text-sm">
                        {voice.name}
                      </span>
                      {voice.isPtBr && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          PT-BR
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-400">
                    {voice.gender && (
                      <span className="px-1.5 py-0.5 bg-white/[0.05] rounded capitalize">
                        {voice.gender === "female"
                          ? "Feminina"
                          : voice.gender === "male"
                          ? "Masculina"
                          : voice.gender}
                      </span>
                    )}
                    {voice.useCase && (
                      <span className="px-1.5 py-0.5 bg-white/[0.05] rounded capitalize">
                        {voice.useCase.replace(/_/g, " ")}
                      </span>
                    )}
                    {voice.accent && (
                      <span className="px-1.5 py-0.5 bg-white/[0.05] rounded capitalize">
                        {voice.accent}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-slate-500">
                    {voice.category || "Voz"}
                  </span>
                  <VoicePreview
                    previewUrl={voice.previewUrl}
                    voiceName={voice.name}
                    isPlaying={isPlaying}
                    onPlay={() => handlePlayPreview(voice.voiceId, voice.previewUrl)}
                    onStop={handleStopPreview}
                  />
                </div>
              </div>
            );
          })}

          {filteredVoices.length === 0 && (
            <div className="col-span-full py-8 text-center text-xs text-slate-400">
              Nenhuma voz encontrada com o termo &ldquo;{searchTerm}&rdquo;.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
