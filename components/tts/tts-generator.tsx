"use client";

// ### importação de dependências do react e componentes do estúdio voice ###
import React, { useState, useEffect, useRef, useCallback } from "react";
import { TextInput } from "./text-input";
import { VoiceSelector } from "./voice-selector";
import { AdvancedSettings } from "./advanced-settings";
import { GenerationResult } from "./generation-result";
import { HistoryDrawer } from "./history-drawer";
import { QuotaBanner } from "../api-keys/quota-banner";
import { useApiKeys } from "../api-keys/api-keys-context";
import { parseApiError } from "@/lib/client/api";
import {
  VoiceItem,
  ClientVoiceSettings,
  GenerationHistoryItem,
} from "@/types/elevenlabs";
import { STORAGE_KEYS, TTS_CONFIG, PRODUCT_TTS } from "@/lib/constants";
import {
  Sparkles,
  Loader2,
  AudioWaveform,
  AlertTriangle,
  History,
  Key,
  Volume2,
  Bookmark,
} from "lucide-react";

// ### modelos de texto pré-configurados para teste instantâneo ###
const QUICK_TEMPLATES = [
  {
    label: "Podcast & Intro",
    text: "Sejam muito bem-vindos ao episódio de hoje! Prepare-se, porque o tema que vamos debater agora vai mudar completamente a forma como você enxerga a tecnologia no Brasil.",
  },
  {
    label: "Roteiro de Vídeo",
    text: "Você sabia que mais de 80% das pessoas retêm melhor a informação quando ouvem uma narração natural e expressiva? É exatamente esse o poder que a inteligência artificial traz para os seus conteúdos.",
  },
  {
    label: "Comercial / Spot",
    text: "Chegou o momento de levar o seu projeto para o próximo nível. Qualidade de áudio cristalina, vozes cativantes e entrega instantânea. Experimente agora mesmo!",
  },
];

export function TtsGenerator() {
  const { getKeyHeaders, openModal, refreshUsage, keys } = useApiKeys();

  // ### estados de entrada, vozes e configuração acústica ###
  const [text, setText] = useState("");
  const [voices, setVoices] = useState<VoiceItem[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState("");
  const [settings, setSettings] = useState<ClientVoiceSettings>(TTS_CONFIG.defaultSettings);
  const [hasPtBr, setHasPtBr] = useState(true);

  // ### estados de carregamento e erros ###
  const [isLoadingVoices, setIsLoadingVoices] = useState(true);
  const [voicesError, setVoicesError] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // ### estados de resultado de áudio gerado ###
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lastGeneratedInfo, setLastGeneratedInfo] = useState<{
    voiceName: string;
    charCount: number;
  } | null>(null);

  // ### histórico local de gerações ###
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const resultRef = useRef<HTMLDivElement | null>(null);

  // ### carregamento inicial de rascunhos salvos no localstorage ###
  useEffect(() => {
    try {
      const savedText = localStorage.getItem(STORAGE_KEYS.DRAFT_TEXT);
      if (savedText) setText(savedText);

      const savedSettings = localStorage.getItem(STORAGE_KEYS.VOICE_SETTINGS);
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }

      const savedHistory = localStorage.getItem(STORAGE_KEYS.TTS_HISTORY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (e) {
      console.warn("localstorage inacessível:", e);
    }
  }, []);

  const handleTextChange = (val: string) => {
    setText(val);
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT_TEXT, val);
    } catch (e) {
      console.warn("erro ao salvar rascunho:", e);
    }
  };

  const handleSettingsChange = (newSettings: ClientVoiceSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem(STORAGE_KEYS.VOICE_SETTINGS, JSON.stringify(newSettings));
    } catch (e) {
      console.warn("erro ao salvar configurações:", e);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    try {
      localStorage.setItem(STORAGE_KEYS.SELECTED_VOICE_ID, voiceId);
    } catch (e) {
      console.warn("erro ao salvar voz:", e);
    }
  };

  // ### busca de vozes na api com injeção de chave se disponível ###
  const fetchVoices = useCallback(async () => {
    setIsLoadingVoices(true);
    setVoicesError(null);

    try {
      const res = await fetch("/api/voices", {
        headers: {
          ...getKeyHeaders(),
        },
        cache: "no-store",
      });

      if (!res.ok) {
        const err = await parseApiError(res, "elevenlabs");
        if (err.needsUserKey) {
          openModal("elevenlabs", err.message);
        }
        throw err;
      }

      const data = await res.json();
      setVoices(data.voices || []);
      setHasPtBr(data.hasPtBr);

      const savedVoiceId = localStorage.getItem(STORAGE_KEYS.SELECTED_VOICE_ID);
      const voiceExists = (data.voices || []).some((v: VoiceItem) => v.voiceId === savedVoiceId);

      if (savedVoiceId && voiceExists) {
        setSelectedVoiceId(savedVoiceId);
      } else if (data.voices && data.voices.length > 0) {
        setSelectedVoiceId(data.voices[0].voiceId);
      }
    } catch (err: unknown) {
      const e = err as Error;
      setVoicesError(e.message || "não foi possível carregar as vozes.");
    } finally {
      setIsLoadingVoices(false);
    }
  }, [keys.elevenlabs]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  // ### liberação de memória de urls de áudio geradas ###
  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // ### execução da síntese de fala no servidor ###
  const handleGenerate = async () => {
    const trimmed = text.trim();
    if (!trimmed || !selectedVoiceId || isGenerating) return;

    setIsGenerating(true);
    setGenerationError(null);

    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }

    try {
      const response = await fetch("/api/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getKeyHeaders(),
        },
        body: JSON.stringify({
          text: trimmed,
          voiceId: selectedVoiceId,
          voiceSettings: settings,
        }),
      });

      if (!response.ok) {
        const err = await parseApiError(response, "elevenlabs");
        if (err.needsUserKey) {
          openModal("elevenlabs", err.message);
        }
        throw err;
      }

      const blob = await response.blob();
      const newUrl = URL.createObjectURL(blob);

      const selectedVoice = voices.find((v) => v.voiceId === selectedVoiceId);
      const voiceName = selectedVoice?.name || "Voz selecionada";

      setAudioUrl(newUrl);
      setLastGeneratedInfo({
        voiceName,
        charCount: trimmed.length,
      });

      // ### gravação do item gerado no histórico do localstorage ###
      const newHistoryItem: GenerationHistoryItem = {
        id: Date.now().toString(),
        text: trimmed,
        voiceId: selectedVoiceId,
        voiceName,
        characterCount: trimmed.length,
        createdAt: new Date().toISOString(),
        settings: { ...settings },
      };

      const updatedHistory = [newHistoryItem, ...history.slice(0, 19)];
      setHistory(updatedHistory);
      try {
        localStorage.setItem(STORAGE_KEYS.TTS_HISTORY, JSON.stringify(updatedHistory));
      } catch (e) {
        console.warn("erro ao salvar histórico:", e);
      }

      refreshUsage();

      setTimeout(() => {
        if (resultRef.current) {
          resultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      }, 100);
    } catch (err: unknown) {
      const e = err as Error;
      setGenerationError(e.message || "não foi possível gerar o áudio.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectHistoryItem = (item: GenerationHistoryItem) => {
    setText(item.text);
    if (voices.some((v) => v.voiceId === item.voiceId)) {
      setSelectedVoiceId(item.voiceId);
    }
    if (item.settings) {
      setSettings(item.settings);
    }
    setAudioUrl(null);
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.TTS_HISTORY);
    } catch (e) {
      console.warn("erro ao limpar histórico:", e);
    }
  };

  const handleDeleteHistoryItem = (id: string) => {
    const filtered = history.filter((h) => h.id !== id);
    setHistory(filtered);
    try {
      localStorage.setItem(STORAGE_KEYS.TTS_HISTORY, JSON.stringify(filtered));
    } catch (e) {
      console.warn("erro ao remover item:", e);
    }
  };

  const isButtonDisabled =
    text.trim().length === 0 || !selectedVoiceId || isGenerating || isLoadingVoices;

  return (
    <section id="estudio-voice" className="py-14 sm:py-20 relative">
      <div className="container-app">
        {/* ### container principal do estúdio sonora voice ### */}
        <div className="glass-card p-6 sm:p-10 lg:p-12 relative overflow-hidden border border-violet-500/20">
          {/* ### iluminação suave de fundo ### */}
          <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* ### cabeçalho do estúdio ### */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 pb-7 border-b border-white/[0.08]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30 flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{PRODUCT_TTS}</span>
                </span>
                <span className="text-xs text-slate-400">Síntese Neural ElevenLabs</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-display pt-1">
                Transforme texto em fala natural expressiva
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Cole seu roteiro em português do Brasil e gere áudios com entonação humana ultra-realista.
              </p>
            </div>

            {/* ### atalhos de gerenciamento e histórico ### */}
            <div className="flex items-center gap-2 flex-wrap flex-shrink-0">
              <button
                type="button"
                onClick={() => openModal("elevenlabs")}
                className="glass-button text-xs py-2 px-3.5"
                title="Configurar chave de API ElevenLabs"
              >
                <Key className="w-3.5 h-3.5 text-violet-400" />
                <span>Configurar Chave</span>
              </button>

              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIsHistoryOpen(true)}
                  className="glass-button text-xs py-2 px-3.5"
                >
                  <History className="w-3.5 h-3.5 text-violet-400" />
                  <span>Histórico ({history.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* ### banner de cota de uso gratuita ### */}
          <div className="mt-6">
            <QuotaBanner provider="elevenlabs" />
          </div>

          {/* ### templates rápidos de teste ### */}
          <div className="mt-6 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-violet-400" />
              <span>Modelos rápidos:</span>
            </span>
            {QUICK_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTextChange(tmpl.text)}
                disabled={isGenerating}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border border-white/5 transition-all"
              >
                {tmpl.label}
              </button>
            ))}
          </div>

          {/* ### formulário principal de geração de áudio ### */}
          <div className="mt-6 space-y-6">
            <TextInput
              text={text}
              onChange={handleTextChange}
              disabled={isGenerating}
            />

            <VoiceSelector
              voices={voices}
              selectedVoiceId={selectedVoiceId}
              onSelectVoice={handleVoiceSelect}
              isLoading={isLoadingVoices}
              error={voicesError}
              onRetry={fetchVoices}
              hasPtBr={hasPtBr}
            />

            <AdvancedSettings
              settings={settings}
              onChange={handleSettingsChange}
              disabled={isGenerating}
            />

            {/* ### exibição de mensagem de erro da api ### */}
            {generationError && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-start gap-3 animate-fade-in">
                <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-rose-200">Não foi possível concluir a síntese</p>
                  <p className="text-xs text-rose-300/90 leading-relaxed">{generationError}</p>
                </div>
              </div>
            )}

            {/* ### botão de disparo para síntese ### */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isButtonDisabled}
                onClick={handleGenerate}
                className={`w-full py-4 px-6 rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all ${
                  isButtonDisabled
                    ? "bg-white/[0.04] text-slate-500 cursor-not-allowed border border-white/5"
                    : "btn-primary"
                }`}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sintetizando fala natural com IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Gerar Narração em MP3</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ### exibição do resultado sintetizado ### */}
          <div ref={resultRef}>
            {audioUrl && lastGeneratedInfo ? (
              <GenerationResult
                audioUrl={audioUrl}
                voiceName={lastGeneratedInfo.voiceName}
                characterCount={lastGeneratedInfo.charCount}
                onGenerateAgain={() => {
                  setAudioUrl(null);
                  const el = document.getElementById("estudio-voice");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
              />
            ) : (
              <div className="mt-8 pt-8 border-t border-white/[0.08] flex items-center justify-center gap-2.5 text-slate-500 text-xs py-4">
                <AudioWaveform className="w-4 h-4 text-slate-600" />
                <span>O áudio gerado aparecerá aqui pronto para reprodução e download em MP3.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ### gaveta de histórico de sínteses gravadas ### */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectHistoryItem={handleSelectHistoryItem}
        onClearHistory={handleClearHistory}
        onDeleteItem={handleDeleteHistoryItem}
      />
    </section>
  );
}
