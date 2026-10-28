"use client";

import React, { useState } from "react";
import { ClientVoiceSettings } from "@/types/elevenlabs";
import { TTS_CONFIG } from "@/lib/constants";
import { ChevronDown, ChevronUp, RotateCcw, Sliders } from "lucide-react";

interface AdvancedSettingsProps {
  settings: ClientVoiceSettings;
  onChange: (newSettings: ClientVoiceSettings) => void;
  disabled?: boolean;
}

export function AdvancedSettings({ settings, onChange, disabled }: AdvancedSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onChange({ ...TTS_CONFIG.defaultSettings });
  };

  const isModified =
    settings.stability !== TTS_CONFIG.defaultSettings.stability ||
    settings.similarityBoost !== TTS_CONFIG.defaultSettings.similarityBoost ||
    settings.style !== TTS_CONFIG.defaultSettings.style ||
    settings.speed !== TTS_CONFIG.defaultSettings.speed ||
    settings.useSpeakerBoost !== TTS_CONFIG.defaultSettings.useSpeakerBoost;

  return (
    <div className="border border-white/5 rounded-2xl bg-white/[0.02] overflow-hidden">
      {/* Header bar */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-300">Estilo de voz:</span>
          <span className="text-xs font-bold text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/30">
            {isModified ? "Personalizado" : "Natural padrão"}
          </span>
        </div>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
        >
          <span>{isOpen ? "Ocultar ajustes" : "Ajustes avançados"}</span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-5 pt-3 border-t border-white/5 space-y-5 bg-ink-900/50 animate-fade-in">
          {/* Estabilidade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Estabilidade</span>
              <span className="font-mono text-violet-300">{settings.stability.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={disabled}
              value={settings.stability}
              onChange={(e) =>
                onChange({ ...settings, stability: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-[11px] text-slate-400">
              Valores menores tornam a fala mais dinâmica e expressiva. Valores maiores deixam o tom mais estável e uniforme.
            </p>
          </div>

          {/* Similaridade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Similaridade (Clareza)</span>
              <span className="font-mono text-violet-300">
                {settings.similarityBoost.toFixed(2)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={disabled}
              value={settings.similarityBoost}
              onChange={(e) =>
                onChange({ ...settings, similarityBoost: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-[11px] text-slate-400">
              Preserva a fidelidade máxima da voz original contra artefatos sonoros.
            </p>
          </div>

          {/* Estilo */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Exagero de Estilo</span>
              <span className="font-mono text-violet-300">{settings.style.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              disabled={disabled}
              value={settings.style}
              onChange={(e) =>
                onChange({ ...settings, style: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-[11px] text-slate-400">
              Intensifica a interpretação dramática e nuance emocional da voz.
            </p>
          </div>

          {/* Velocidade */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200">Velocidade da Narração</span>
              <span className="font-mono text-violet-300">{settings.speed.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.2"
              step="0.05"
              disabled={disabled}
              value={settings.speed}
              onChange={(e) =>
                onChange({ ...settings, speed: parseFloat(e.target.value) })
              }
              className="w-full"
            />
            <p className="text-[11px] text-slate-400">
              Ajuste entre 0.7x (mais lento e pausado) a 1.2x (mais acelerado).
            </p>
          </div>

          {/* Speaker Boost Toggle */}
          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">
                Fidelidade de Timbre (Speaker Boost)
              </span>
              <span className="text-[11px] text-slate-400 block">
                Otimiza a similaridade tonal com o falante original.
              </span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={settings.useSpeakerBoost}
              disabled={disabled}
              onClick={() =>
                onChange({ ...settings, useSpeakerBoost: !settings.useSpeakerBoost })
              }
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center px-0.5 ${
                settings.useSpeakerBoost ? "bg-violet-600 shadow-[0_0_12px_rgba(139,92,246,0.6)]" : "bg-slate-700"
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full bg-white shadow-sm transform transition-transform ${
                  settings.useSpeakerBoost ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Reset button */}
          {isModified && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                disabled={disabled}
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 hover:text-violet-300"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar padrão Natural</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
