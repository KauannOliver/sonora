"use client";

import React, { useState } from "react";
import type { TranscriptionHistoryItem } from "@/types/transcription";
import { formatBytes, formatDuration, downloadText } from "@/lib/utils";
import { generateConsolidatedText } from "@/lib/transcripts";
import {
  History,
  Search,
  Download,
  Trash2,
  FileAudio,
  Eye,
  Calendar,
} from "lucide-react";

interface TranscriptionHistoryProps {
  history: TranscriptionHistoryItem[];
  onOpenItem: (item: TranscriptionHistoryItem) => void;
  onDeleteItem: (id: string) => void;
  onClearHistory: () => void;
}

export function TranscriptionHistory({
  history,
  onOpenItem,
  onDeleteItem,
  onClearHistory,
}: TranscriptionHistoryProps) {
  const [search, setSearch] = useState("");

  const filtered = history.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (item.filename && item.filename.toLowerCase().includes(q)) ||
      (item.text && item.text.toLowerCase().includes(q))
    );
  });

  const handleExportAll = () => {
    if (history.length === 0) return;
    const txt = generateConsolidatedText(history, "HISTÓRICO CONSOLIDADO COMPLETO");
    const dateStr = new Date().toISOString().slice(0, 10);
    downloadText(txt, `whisper_ia_historico_consolidado_${dateStr}.txt`);
  };

  const handleDownloadSingle = (item: TranscriptionHistoryItem) => {
    const txt = generateConsolidatedText([item], `TRANSCRIÇÃO INDIVIDUAL - ${item.filename}`);
    const name = `transcricao_${item.filename.replace(/\.[^/.]+$/, "")}.txt`;
    downloadText(txt, name);
  };

  return (
    <section id="historico-transcricoes" className="py-12 relative border-t border-white/5">
      <div className="container-app space-y-6">
        {/* Cabeçalho da seção */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-orange-400" />
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Histórico de Transcrições
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Todas as transcrições salvas localmente no navegador ({history.length} itens gravados).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              disabled={history.length === 0}
              onClick={handleExportAll}
              className="btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              <span>Baixar Consolidado Geral</span>
            </button>

            <button
              type="button"
              disabled={history.length === 0}
              onClick={() => {
                if (confirm("Deseja apagar todo o histórico de transcrições deste navegador?")) {
                  onClearHistory();
                }
              }}
              className="btn-danger btn-sm inline-flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Barra de busca */}
        {history.length > 0 && (
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome do arquivo de áudio ou palavra falada..."
              className="input pl-10 pr-4 text-xs sm:text-sm"
            />
          </div>
        )}

        {/* Lista de itens */}
        {history.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-white/5 bg-white/[0.02] text-slate-500 text-sm space-y-2">
            <FileAudio className="w-8 h-8 text-slate-600 mx-auto" />
            <p>Nenhuma transcrição gravada no histórico ainda.</p>
            <p className="text-xs text-slate-600">
              Seus lotes de áudio transcritos aparecerão aqui automaticamente.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-white/5 bg-white/[0.02] text-slate-400 text-xs">
            Nenhuma transcrição encontrada para &ldquo;{search}&rdquo;.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((item) => {
              const dateStr = item.savedAt
                ? new Date(item.savedAt).toLocaleString("pt-BR")
                : "Sem data";
              const preview =
                item.text && item.text.length > 140
                  ? item.text.slice(0, 140) + "..."
                  : item.text || "[Sem texto]";

              return (
                <div
                  key={item.id}
                  className="card-soft p-5 flex flex-col justify-between space-y-3 hover:border-orange-500/30 transition-all group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                          <FileAudio className="w-4 h-4" />
                        </div>
                        <div className="overflow-hidden">
                          <h4
                            className="font-semibold text-white text-sm truncate"
                            title={item.filename}
                          >
                            {item.filename}
                          </h4>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3 h-3" />
                            <span>{dateStr}</span>
                            <span>•</span>
                            <span>{formatBytes(item.filesize)}</span>
                            {item.duration && (
                              <>
                                <span>•</span>
                                <span>{formatDuration(item.duration)}</span>
                              </>
                            )}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onDeleteItem(item.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-opacity"
                        title="Remover este item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 italic leading-relaxed pt-1">
                      &ldquo;{preview}&rdquo;
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      {item.keyUsed || "Groq Whisper"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onOpenItem(item)}
                        className="btn-ghost btn-sm text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Ver</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadSingle(item)}
                        className="btn-secondary btn-sm text-[11px] py-1 px-2.5 inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3 text-orange-400" />
                        <span>TXT</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
