"use client";

// ### importação de dependências react e utilitários de transcrição ###
import React, { useState, useEffect, useRef } from "react";
import { QuotaBanner } from "../api-keys/quota-banner";
import { TranscriptModal } from "./transcript-modal";
import { TranscriptionHistory } from "./transcription-history";
import { useApiKeys } from "../api-keys/api-keys-context";
import { parseApiError } from "@/lib/client/api";
import { TRANSCRIBE_CONFIG, PRODUCT_STT } from "@/lib/constants";
import { formatBytes, downloadText } from "@/lib/utils";
import {
  loadTranscriptions,
  saveTranscriptions,
  toHistoryItems,
  generateConsolidatedText,
  timestampForFile,
} from "@/lib/transcripts";
import type {
  TranscriptionResult,
  TranscriptionHistoryItem,
} from "@/types/transcription";
import {
  UploadCloud,
  FileAudio,
  Trash2,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  RotateCcw,
  Key,
  Check,
  Mic,
  FileCheck,
} from "lucide-react";

// ### interface de controle de arquivo na fila de processamento ###
interface QueuedFile {
  file: File;
  status: "idle" | "processing" | "success" | "error";
  error?: string;
  result?: TranscriptionResult;
}

export function TranscribeStudio() {
  const { getKeyHeaders, openModal, refreshUsage } = useApiKeys();

  // ### estados da fila, processamento e arrasto de arquivos ###
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [logs, setLogs] = useState<Array<{ time: string; text: string; type: "info" | "success" | "error" }>>([]);
  const [batchFinished, setBatchFinished] = useState(false);
  const [batchResults, setBatchResults] = useState<TranscriptionResult[]>([]);
  const [history, setHistory] = useState<TranscriptionHistoryItem[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<TranscriptionHistoryItem | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const logBoxRef = useRef<HTMLDivElement | null>(null);

  // ### carregamento das transcrições gravadas no histórico ###
  useEffect(() => {
    setHistory(loadTranscriptions());
  }, []);

  // ### inclusão de entradas no console de logs em tempo real ###
  const addLog = (text: string, type: "info" | "success" | "error" = "info") => {
    const time = new Date().toLocaleTimeString("pt-BR");
    setLogs((prev) => [...prev, { time, text, type }]);
    setTimeout(() => {
      if (logBoxRef.current) {
        logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
      }
    }, 50);
  };

  // ### validação e inclusão de arquivos na fila do lote ###
  const handleFiles = (incoming: FileList | File[]) => {
    if (isProcessing) return;

    const filesArray = Array.from(incoming);
    const valid: File[] = [];
    const invalid: string[] = [];

    filesArray.forEach((f) => {
      const name = f.name.toLowerCase();
      const ok =
        TRANSCRIBE_CONFIG.allowedExtensions.some((ext) => name.endsWith(ext)) ||
        f.type.startsWith("audio/");
      if (ok) {
        valid.push(f);
      } else {
        invalid.push(f.name);
      }
    });

    if (invalid.length > 0) {
      addLog(`arquivos ignorados (formato não suportado): ${invalid.join(", ")}`, "error");
    }

    if (valid.length === 0) return;

    const currentCount = queue.length;
    const available = TRANSCRIBE_CONFIG.maxFiles - currentCount;

    if (available <= 0) {
      addLog(`limite máximo de ${TRANSCRIBE_CONFIG.maxFiles} arquivos por lote atingido.`, "error");
      return;
    }

    let toAdd = valid;
    if (valid.length > available) {
      toAdd = valid.slice(0, available);
      addLog(`adicionados apenas ${available} arquivos para respeitar o limite máximo do lote.`, "info");
    }

    const newItems: QueuedFile[] = [];
    toAdd.forEach((f) => {
      const exists = queue.some((q) => q.file.name === f.name && q.file.size === f.size);
      if (!exists) {
        newItems.push({ file: f, status: "idle" });
      }
    });

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems]);
      setBatchFinished(false);
      addLog(`${newItems.length} arquivo(s) adicionado(s) à fila de transcrição.`, "info");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeQueueItem = (idx: number) => {
    if (isProcessing) return;
    setQueue((prev) => prev.filter((_, i) => i !== idx));
  };

  const clearQueue = () => {
    if (isProcessing) return;
    setQueue([]);
    setBatchFinished(false);
    setBatchResults([]);
    setLogs([]);
  };

  // ### disparo e orquestração do processamento do lote ###
  const handleStartTranscribe = async () => {
    if (queue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    setBatchFinished(false);
    setBatchResults([]);
    setLogs([]);
    setCurrentIndex(0);

    addLog(
      `iniciando transcrição de ${queue.length} arquivo(s) com groq whisper large v3 (pt-br verbatim)...`,
      "info"
    );

    const results: TranscriptionResult[] = [];
    let completedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < queue.length; i++) {
      setCurrentIndex(i);
      const current = queue[i];

      setQueue((prev) =>
        prev.map((item, idx) => (idx === i ? { ...item, status: "processing" } : item))
      );

      addLog(`[${i + 1}/${queue.length}] transcrevendo "${current.file.name}"...`, "info");

      try {
        const formData = new FormData();
        formData.append("file", current.file, current.file.name);

        const res = await fetch("/api/transcribe", {
          method: "POST",
          headers: {
            ...getKeyHeaders(),
          },
          body: formData,
        });

        if (!res.ok) {
          const err = await parseApiError(res, "groq");
          if (err.needsUserKey) {
            openModal("groq", err.message);
          }
          throw err;
        }

        const data: TranscriptionResult = await res.json();
        results.push(data);
        completedCount++;

        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "success", result: data } : item
          )
        );

        addLog(
          `✓ concluído: "${current.file.name}" (${data.elapsedSeconds}s, ${data.text.length} caracteres)`,
          "success"
        );
      } catch (err: unknown) {
        failedCount++;
        const e = err as Error;
        addLog(`✕ erro em "${current.file.name}": ${e.message}`, "error");

        const fallbackItem: TranscriptionResult = {
          filename: current.file.name,
          filesize: current.file.size,
          duration: null,
          language: "pt",
          text: `[falha na transcrição]: ${e.message}`,
          segments: [],
          elapsedSeconds: "0",
          keyUsed: "N/A",
          timestamp: new Date().toISOString(),
          failed: true,
        };
        results.push(fallbackItem);

        setQueue((prev) =>
          prev.map((item, idx) =>
            idx === i ? { ...item, status: "error", error: e.message } : item
          )
        );
      }
    }

    setIsProcessing(false);
    setBatchResults(results);
    setBatchFinished(true);
    refreshUsage();

    addLog(
      `lote finalizado: ${completedCount} arquivo(s) transcrito(s) com sucesso, ${failedCount} falha(s).`,
      completedCount > 0 ? "success" : "error"
    );

    // ### salvamento no histórico local e download automático do consolidado ###
    if (results.length > 0) {
      const historyEntries = toHistoryItems(results);
      const updatedHistory = [...historyEntries, ...history];
      setHistory(updatedHistory);
      saveTranscriptions(updatedHistory);

      const fileName = `sonora_transcricoes_${timestampForFile()}.txt`;
      const txt = generateConsolidatedText(
        results,
        `TRANSCRIÇÕES CONSOLIDADAS (${results.length} ÁUDIOS)`
      );
      downloadText(txt, fileName);
      addLog(`arquivo consolidado "${fileName}" gerado e baixado automaticamente!`, "success");
    }
  };

  const handleDownloadBatchTxt = () => {
    if (batchResults.length === 0) return;
    const fileName = `sonora_transcricoes_${timestampForFile()}.txt`;
    const txt = generateConsolidatedText(
      batchResults,
      `TRANSCRIÇÕES CONSOLIDADAS (${batchResults.length} ÁUDIOS)`
    );
    downloadText(txt, fileName);
  };

  const handleCopyBatchTxt = async () => {
    if (batchResults.length === 0) return;
    const txt = generateConsolidatedText(batchResults, "LOTE DE TRANSCRIÇÕES");
    try {
      await navigator.clipboard.writeText(txt);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // ### ignora falha de clipboard do sistema ###
    }
  };

  const progressPercent =
    queue.length === 0
      ? 0
      : batchFinished
      ? 100
      : Math.round((currentIndex / queue.length) * 100);

  return (
    <section id="estudio-scribe" className="py-14 sm:py-20 relative">
      <div className="container-app">
        {/* ### container principal do estúdio sonora scribe ### */}
        <div className="glass-card p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-orange-500/20">
          {/* ### iluminação suave de fundo ### */}
          <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* ### cabeçalho do estúdio ### */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-7 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" />
                  <span>{PRODUCT_STT}</span>
                </span>
                <span className="text-xs text-slate-400">Groq LPU + Whisper Large V3</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display pt-1">
                Transcrição ultra-veloz de áudios em lote
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Envie até 10 arquivos simultâneos. Fidelidade verbatim 100% sem censura em Português do Brasil com download automático.
              </p>
            </div>

            {/* ### atalhos de gerenciamento e histórico ### */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <button
                type="button"
                onClick={() => openModal("groq")}
                className="glass-button text-xs py-2 px-3.5"
                title="Configurar chave de API Groq"
              >
                <Key className="w-3.5 h-3.5 text-orange-400" />
                <span>Configurar Chave</span>
              </button>

              {history.length > 0 && (
                <a
                  href="#historico-transcricoes"
                  className="glass-button text-xs py-2 px-3.5"
                >
                  <span>Histórico ({history.length})</span>
                </a>
              )}
            </div>
          </div>

          {/* ### banner de cota de uso gratuita ### */}
          <div className="mt-6">
            <QuotaBanner provider="groq" />
          </div>

          {/* ### área de arrastar e soltar (dropzone) ### */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`mt-6 rounded-3xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden ${
              isDragging
                ? "border-orange-400 bg-orange-500/15 shadow-glow-orange scale-[1.01]"
                : "border-white/10 bg-obsidian-900/60 hover:border-orange-500/40 hover:bg-white/[0.02]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,.webm,.flac,audio/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }
              }}
            />

            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-orange-500/20 to-amber-500/10 text-orange-400 flex items-center justify-center mb-4 border border-orange-500/30 shadow-glow-orange">
              <UploadCloud className="w-8 h-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-display">
              Arraste e solte seus áudios aqui
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-md">
              ou clique para selecionar do computador. Aceita <strong>MP3, WAV, M4A, OGG, WEBM, FLAC</strong> (até 25 MB por áudio).
            </p>

            {/* ### badges de recursos do estúdio scribe ### */}
            <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
              <span className="chip">📦 Até 10 arquivos por lote</span>
              <span className="chip">🇧🇷 Português do Brasil (PT-BR)</span>
              <span className="chip">🗣️ 100% Verbatim sem censura</span>
              <span className="chip">⚡ Aceleração Groq LPU</span>
            </div>
          </div>

          {/* ### fila de arquivos selecionados para envio ### */}
          {queue.length > 0 && (
            <div className="mt-8 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-white text-sm">
                    Fila de Processamento ({queue.length}/{TRANSCRIBE_CONFIG.maxFiles})
                  </h3>
                </div>

                {!isProcessing && (
                  <button
                    type="button"
                    onClick={clearQueue}
                    className="text-xs text-slate-400 hover:text-rose-400 transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Limpar fila</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {queue.map((item, idx) => (
                  <div
                    key={idx}
                    className={`glass-panel p-3.5 flex items-center justify-between gap-3 text-xs ${
                      item.status === "processing"
                        ? "border-orange-500/50 bg-orange-500/10 shadow-[0_0_15px_rgba(234,88,12,0.2)]"
                        : item.status === "success"
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : item.status === "error"
                        ? "border-rose-500/30 bg-rose-500/5"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0 text-slate-300">
                        <FileAudio className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="font-medium text-white block truncate" title={item.file.name}>
                          {item.file.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {formatBytes(item.file.size)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {item.status === "idle" && (
                        <span className="text-[11px] text-slate-400 px-2 py-0.5 rounded bg-white/[0.05]">
                          Aguardando
                        </span>
                      )}
                      {item.status === "processing" && (
                        <span className="text-[11px] font-semibold text-orange-300 px-2 py-0.5 rounded bg-orange-500/20 border border-orange-500/30 animate-pulse">
                          Transcrevendo...
                        </span>
                      )}
                      {item.status === "success" && (
                        <span className="text-[11px] font-semibold text-emerald-300 px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Concluído</span>
                        </span>
                      )}
                      {item.status === "error" && (
                        <span className="text-[11px] font-semibold text-rose-300 px-2 py-0.5 rounded bg-rose-500/15 border border-rose-500/30 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          <span>Falhou</span>
                        </span>
                      )}

                      {!isProcessing && (
                        <button
                          type="button"
                          onClick={() => removeQueueItem(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remover da fila"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ### botão de disparo para início da transcrição ### */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={isProcessing || queue.length === 0}
                  onClick={handleStartTranscribe}
                  className="btn-scribe w-full py-4 text-base font-bold flex items-center justify-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  <span>
                    {isProcessing
                      ? `Transcrevendo arquivo ${currentIndex + 1} de ${queue.length}...`
                      : `Iniciar Transcrição do Lote (${queue.length} arquivo${queue.length > 1 ? "s" : ""})`}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ### console de progresso e logs ao vivo ### */}
          {(isProcessing || logs.length > 0) && (
            <div className="mt-8 space-y-3 p-5 rounded-2xl bg-obsidian-950/80 border border-white/[0.08] animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300">
                  {isProcessing
                    ? `Processando ${currentIndex + 1} de ${queue.length}...`
                    : batchFinished
                    ? "Lote finalizado com sucesso!"
                    : "Status da fila"}
                </span>
                <span className="font-mono text-orange-400 font-bold">{progressPercent}%</span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-grad-scribe transition-all duration-300 shadow-glow-orange"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div
                ref={logBoxRef}
                className="max-h-36 overflow-y-auto space-y-1 text-[11px] font-mono p-3 rounded-xl bg-obsidian-900/90 border border-white/5 text-slate-300"
              >
                {logs.map((lg, i) => (
                  <div
                    key={i}
                    className={`leading-relaxed ${
                      lg.type === "success"
                        ? "text-emerald-400"
                        : lg.type === "error"
                        ? "text-rose-400 font-bold"
                        : "text-slate-400"
                    }`}
                  >
                    <span className="text-slate-600">[{lg.time}]</span> {lg.text}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ### banner de lote concluído com download imediato ### */}
          {batchFinished && batchResults.length > 0 && (
            <div className="mt-8 p-6 rounded-3xl border border-emerald-500/30 bg-emerald-500/10 animate-slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <h4 className="font-bold text-white text-base">
                    Lote Transcrito com Sucesso!
                  </h4>
                </div>
                <p className="text-xs text-slate-300 max-w-xl">
                  O arquivo <strong>.txt consolidado</strong> já foi baixado automaticamente. Você também pode baixá-lo novamente ou copiar o conteúdo.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={handleDownloadBatchTxt}
                  className="btn-success btn-sm inline-flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar TXT Consolidado</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyBatchTxt}
                  className="glass-button btn-sm inline-flex items-center gap-1.5"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQueue([]);
                    setBatchFinished(false);
                    setBatchResults([]);
                    setLogs([]);
                  }}
                  className="btn-ghost btn-sm inline-flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Novo lote</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ### histórico de transcrições e modal de visualização ### */}
      <TranscriptionHistory
        history={history}
        onOpenItem={(it) => setSelectedHistoryItem(it)}
        onDeleteItem={(id) => {
          const updated = history.filter((h) => h.id !== id);
          setHistory(updated);
          saveTranscriptions(updated);
        }}
        onClearHistory={() => {
          setHistory([]);
          saveTranscriptions([]);
        }}
      />

      <TranscriptModal
        item={selectedHistoryItem}
        onClose={() => setSelectedHistoryItem(null)}
      />
    </section>
  );
}
