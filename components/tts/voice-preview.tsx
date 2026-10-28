"use client";

import React from "react";
import { Play, Square, Volume2 } from "lucide-react";

interface VoicePreviewProps {
  previewUrl?: string | null;
  voiceName: string;
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
}

export function VoicePreview({
  previewUrl,
  voiceName,
  isPlaying,
  onPlay,
  onStop,
}: VoicePreviewProps) {
  if (!previewUrl) {
    return (
      <span className="text-[10px] text-slate-500 italic">
        Sem amostra
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (isPlaying) {
          onStop();
        } else {
          onPlay();
        }
      }}
      aria-label={isPlaying ? `Pausar amostra de ${voiceName}` : `Ouvir amostra de ${voiceName}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
        isPlaying
          ? "bg-violet-500/20 text-violet-300 border border-violet-500/40 shadow-[0_0_12px_rgba(139,92,246,0.3)] animate-pulse"
          : "bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white border border-white/5"
      }`}
    >
      {isPlaying ? (
        <>
          <Square className="w-3 h-3 fill-current" />
          <span>Parar</span>
        </>
      ) : (
        <>
          <Volume2 className="w-3 h-3 text-violet-400" />
          <span>Ouvir</span>
        </>
      )}
    </button>
  );
}
