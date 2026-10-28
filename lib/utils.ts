// ### importação de utilitários para classes css dinâmicas ###
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ### fusão inteligente de classes do tailwind ###
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ### formatação de segundos para minutagem mm:ss ###
export function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

// ### carimbo de data e hora para nomes de arquivo ###
function stamp(): string {
  const now = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}_${p(now.getHours())}${p(
    now.getMinutes()
  )}${p(now.getSeconds())}`;
}

// ### geração do nome de arquivo mp3 sintetizado ###
export function generateAudioFilename(): string {
  return `sonora_voice_${stamp()}.mp3`;
}

// ### conversão de bytes para formato legível kb/mb ###
export function formatBytes(bytes: number): string {
  if (!bytes) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// ### formatação de duração para relatórios hh:mm:ss ###
export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || isNaN(seconds)) return "N/D";
  const sec = Math.floor(seconds);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const p = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${p(h)}:${p(m)}:${p(s)}` : `${p(m)}:${p(s)}`;
}

// ### download de blob genérico no navegador ###
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// ### download de arquivo de texto simples no navegador ###
export function downloadText(content: string, filename: string) {
  downloadBlob(new Blob([content], { type: "text/plain;charset=utf-8" }), filename);
}

// ### ofuscação de chaves para exibição segura na interface ###
export function maskKey(key: string): string {
  if (!key) return "";
  if (key.length <= 10) return "•".repeat(key.length);
  return `${key.slice(0, 6)}••••••${key.slice(-4)}`;
}

// ### rolagem suave até um elemento específico ###
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) {
    const yOffset = -80;
    const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
    window.scrollTo({ top: y, behavior: "smooth" });
  }
}
