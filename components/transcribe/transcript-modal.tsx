// ### componente de modal para visualizacao detalhada de uma transcricao individual ###
"use client";

import React, { useState } from "react";
import type { TranscriptionHistoryItem } from "@/types/transcription";
import { formatBytes, formatDuration, downloadText } from "@/lib/utils";
import { generateConsolidatedText } from "@/lib/transcripts";
import { X, Copy, Download, Check, FileText, Clock } from "lucide-react";

interface TranscriptModalProps {
  item: TranscriptionHistoryItem | null;
  onClose: () => void;
}

export function TranscriptModal({ item, onClose }: TranscriptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  // ### copia do conteudo da transcricao para a area de transferencia ###
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(item.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ### ignora falha de clipboard no navegador ###
    }
  };

  // ### geracao e download imediato do arquivo de texto individual ###
  const handleDownload = () => {
    const txt = generateConsolidatedText([item], `SONORA SCRIBE - TRANSCRIÇÃO INDIVIDUAL: ${item.filename}`);
    const name = `sonora_scribe_${item.filename.replace(/\.[^/.]+$/, "")}.txt`;
    downloadText(txt, name);
  };

  const dateStr = item.savedAt ? new Date(item.savedAt).toLocaleString("pt-BR") : "";

  return (
    // ### container modal com backdrop blur e animacao ###
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="card-glass rounded-3xl w-full max-w-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] bg-obsidian-900/95">
        {/* ### cabecalho com nome do arquivo e metadados de audio ### */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base truncate max-w-md" title={item.filename}>
                {item.filename}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {dateStr} • {formatBytes(item.filesize)} {item.duration ? `• ${formatDuration(item.duration)}` : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ### corpo com texto verbatim completo e segmentos cronometrados ### */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Transcrição Verbatim Completa (PT-BR)
            </h4>
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-sm text-slate-200 leading-relaxed whitespace-pre-wrap selection:bg-amber-500/30">
              {item.text || "[Nenhum áudio detectado]"}
            </div>
          </div>

          {item.segments && item.segments.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Segmentos com Marcação de Tempo</span>
              </h4>
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {item.segments.map((seg, i) => {
                  const s = formatDuration(seg.start);
                  const e = formatDuration(seg.end);
                  return (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl border border-white/5 bg-white/[0.02] text-xs flex items-start gap-3"
                    >
                      <span className="font-mono text-amber-300 text-[11px] whitespace-nowrap bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                        [{s} → {e}]
                      </span>
                      <span className="text-slate-300">{seg.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ### botoes de acao no rodape do modal ### */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="btn-secondary btn-sm"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copiar texto</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="btn-primary btn-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Baixar TXT individual</span>
          </button>
        </div>
      </div>
    </div>
  );
}
