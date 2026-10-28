// ### importação de configurações e utilitários ###
import { STORAGE_KEYS, TRANSCRIBE_CONFIG, APP_NAME, PRODUCT_STT } from "@/lib/constants";
import { formatBytes, formatDuration } from "@/lib/utils";
import type { TranscriptionHistoryItem, TranscriptionResult } from "@/types/transcription";

// ### carregamento das transcrições gravadas no localstorage ###
export function loadTranscriptions(): TranscriptionHistoryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSCRIPTIONS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// ### gravação das transcrições no localstorage do cliente ###
export function saveTranscriptions(items: TranscriptionHistoryItem[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.TRANSCRIPTIONS, JSON.stringify(items));
  } catch (e) {
    console.warn("não foi possível salvar no localstorage:", e);
  }
}

// ### formatação dos resultados brutos em itens de histórico ###
export function toHistoryItems(results: TranscriptionResult[]): TranscriptionHistoryItem[] {
  const now = Date.now();
  return results.map((r, i) => ({
    ...r,
    id: `tx_${now + i}_${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
  }));
}

// ### formatação de segundos para marcações de segmento [mm:ss] ###
function ts(seconds: number): string {
  if (seconds == null || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ### geração do conteúdo estruturado do relatório consolidado em txt ###
export function generateConsolidatedText(
  items: Array<TranscriptionResult & { savedAt?: string }>,
  title = "CONSOLIDADO DE TRANSCRIÇÕES"
): string {
  if (!items.length) return "Nenhuma transcrição encontrada.";

  const now = new Date();
  const line = "=".repeat(80);
  const dash = "-".repeat(80);

  let out = "";
  out += `${line}\n             ${APP_NAME.toUpperCase()} - ${PRODUCT_STT.toUpperCase()}\n             ${title.toUpperCase()}\n${line}\n`;
  out += `Data da Exportação : ${now.toLocaleDateString("pt-BR")} às ${now.toLocaleTimeString("pt-BR")}\n`;
  out += `Total de Arquivos  : ${items.length} arquivo(s) de áudio\n`;
  out += `Motor de IA        : Groq LPU (${TRANSCRIBE_CONFIG.model})\n`;
  out += "Idioma / Modo      : Português do Brasil (PT-BR) | Verbatim Sem Censura\n";
  out += `${line}\n\n`;

  let totalWords = 0;
  let totalSeconds = 0;

  items.forEach((item, index) => {
    const idx = index + 1;
    const words = item.text ? item.text.trim().split(/\s+/).filter(Boolean).length : 0;
    totalWords += words;
    if (item.duration) totalSeconds += Number(item.duration);

    out += `${dash}\n[ÁUDIO ${idx}/${items.length}] - REFERÊNCIA: ${item.filename}\n${dash}\n`;
    out += `• Arquivo Original : ${item.filename}\n`;
    out += `• Tamanho do Áudio : ${formatBytes(item.filesize)}\n`;
    out += `• Duração Estimada : ${formatDuration(item.duration)}\n`;
    if (item.keyUsed) out += `• Chave Utilizada  : ${item.keyUsed}\n`;
    const when = item.savedAt || item.timestamp;
    if (when) out += `• Processado em    : ${new Date(when).toLocaleString("pt-BR")}\n`;
    out += `• Total de Palavras: ${words}\n`;
    out += "\n--- [TRANSCRIÇÃO VERBATIM COMPLETA (SEM CENSURA)] ---\n\n";
    out += item.text || "[Nenhum áudio detectado]";
    out += "\n\n";

    if (item.segments?.length) {
      out += "--- [DETALHAMENTO POR SEGMENTOS DE TEMPO] ---\n";
      item.segments.forEach((seg) => {
        out += `[${ts(seg.start)} -> ${ts(seg.end)}] ${(seg.text || "").trim()}\n`;
      });
      out += "\n";
    }
    out += "\n";
  });

  out += `${line}\n                               RESUMO FINAL\n${line}\n`;
  out += `• Arquivos Processados: ${items.length}\n`;
  out += `• Tempo Total de Áudio: ${formatDuration(totalSeconds)}\n`;
  out += `• Total de Palavras   : ${totalWords}\n`;
  out += "• Fidelidade          : 100% Verbatim (Gírias, palavrões e coloquialismos preservados)\n";
  out += `${line}\n`;
  return out;
}

// ### carimbo de data para o nome do arquivo consolidado ###
export function timestampForFile(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
}
