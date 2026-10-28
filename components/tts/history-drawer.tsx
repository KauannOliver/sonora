"use client";

import React from "react";
import { GenerationHistoryItem } from "@/types/elevenlabs";
import { History, Trash2, ArrowUpRight, Clock, X } from "lucide-react";

interface HistoryDrawerProps {
  history: GenerationHistoryItem[];
  onSelectHistoryItem: (item: GenerationHistoryItem) => void;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryDrawer({
  history,
  onSelectHistoryItem,
  onClearHistory,
  onDeleteItem,
  isOpen,
  onClose,
}: HistoryDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-md animate-fade-in">
      <div className="glass rounded-3xl w-full max-w-xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/15 text-violet-300 flex items-center justify-center border border-violet-500/30">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Histórico de Fala Gerada</h3>
              <p className="text-xs text-slate-400">Salvo localmente no seu navegador (LocalStorage)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Nenhuma geração gravada no histórico ainda.
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-violet-500/30 transition-all space-y-2 group"
              >
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white">{item.voiceName}</span>
                    <span>•</span>
                    <span>{item.characterCount} caracteres</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(item.createdAt).toLocaleString("pt-BR")}</span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 line-clamp-2 italic">
                  &ldquo;{item.text}&rdquo;
                </p>

                <div className="pt-1 flex items-center justify-between">
                  <button
                    onClick={() => {
                      onSelectHistoryItem(item);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300"
                  >
                    <span>Carregar no editor</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 p-1 transition-opacity"
                    title="Remover do histórico"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
            <span className="text-xs text-slate-400">
              {history.length} {history.length === 1 ? "registro salvo" : "registros salvos"}
            </span>
            <button
              onClick={onClearHistory}
              className="inline-flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar histórico</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
