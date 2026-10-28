// ### componente de entrada de texto com contador de caracteres e atalhos de clipboard ###
"use client";

import React from "react";
import { TTS_CONFIG } from "@/lib/constants";
import { FileText, Trash2, Clipboard } from "lucide-react";

interface TextInputProps {
  text: string;
  onChange: (val: string) => void;
  disabled?: boolean;
}

export function TextInput({ text, onChange, disabled }: TextInputProps) {
  const currentLength = text.length;
  const maxLength = TTS_CONFIG.maxCharacters;
  const isNearLimit = currentLength > maxLength * 0.9;
  const isOverLimit = currentLength > maxLength;

  // ### colar conteudo direto da area de transferencia ###
  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        onChange(text + (text ? "\n" : "") + clipText);
      }
    } catch {
      // ### ignora erro de clipboard se bloqueado pelo navegador ###
    }
  };

  // ### limpar todo o texto da caixa ###
  const handleClear = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      {/* ### cabecalho com rotulo e botoes de acao rapida ### */}
      <div className="flex items-center justify-between">
        <label htmlFor="tts-text-input" className="label">
          <FileText className="w-4 h-4 text-violet-400" />
          <span>Texto para conversão</span>
        </label>

        <div className="flex items-center gap-2">
          {text.length > 0 && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-slate-400 hover:text-rose-400 transition-colors inline-flex items-center gap-1"
              title="Limpar texto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          )}

          {!disabled && (
            <button
              type="button"
              onClick={handlePaste}
              className="text-xs text-violet-400 hover:text-violet-300 transition-colors inline-flex items-center gap-1"
              title="Colar da área de transferência"
            >
              <Clipboard className="w-3.5 h-3.5" />
              <span>Colar</span>
            </button>
          )}
        </div>
      </div>

      {/* ### area de texto com estilos de foco e aviso de limite ### */}
      <div className="relative">
        <textarea
          id="tts-text-input"
          value={text}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Digite ou cole aqui o texto em português que você deseja transformar em voz natural..."
          rows={6}
          className={`input resize-y min-h-[140px] text-sm leading-relaxed p-4 ${
            isOverLimit
              ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
              : ""
          }`}
        />

        {/* ### contador flutuante de caracteres com destaque visual por limite ### */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2">
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded-md ${
              isOverLimit
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold"
                : isNearLimit
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-black/60 text-slate-400 border border-white/5"
            }`}
          >
            {currentLength.toLocaleString("pt-BR")} / {maxLength.toLocaleString("pt-BR")} caracteres
          </span>
        </div>
      </div>
    </div>
  );
}
