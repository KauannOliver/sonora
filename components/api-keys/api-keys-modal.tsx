// ### componente de modal para gerenciamento e teste de chaves de api pessoais ###
"use client";

import React, { useState, useEffect } from "react";
import { useApiKeys } from "./api-keys-context";
import { PROVIDERS } from "@/lib/constants";
import { maskKey } from "@/lib/utils";
import type { Provider } from "@/types/api";
import {
  X,
  Key,
  ShieldCheck,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Trash2,
  Sparkles,
  Info,
  Check,
} from "lucide-react";

export function ApiKeysModal() {
  const {
    isModalOpen,
    closeModal,
    activeProvider: initialProvider,
    modalReason,
    keys,
    saveKey,
    removeKey,
  } = useApiKeys();

  const [currentProvider, setCurrentProvider] = useState<Provider>(initialProvider);
  const [inputValue, setInputValue] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isSavedFeedback, setIsSavedFeedback] = useState(false);

  // ### sincronizacao do provedor inicial ao abrir o modal ###
  useEffect(() => {
    setCurrentProvider(initialProvider);
  }, [initialProvider, isModalOpen]);

  // ### atualizacao do campo de texto com a chave salva ###
  useEffect(() => {
    setInputValue(keys[currentProvider] || "");
    setValidationResult(null);
    setIsSavedFeedback(false);
  }, [currentProvider, keys, isModalOpen]);

  if (!isModalOpen) return null;

  const info = PROVIDERS[currentProvider];
  const isCustomKeyActive = Boolean(keys[currentProvider]);

  // ### funcao para testar a chave diretamente no servidor em tempo real ###
  const handleTestKey = async () => {
    const key = inputValue.trim();
    if (!key) {
      setValidationResult({
        success: false,
        message: "Digite ou cole uma chave antes de testar.",
      });
      return;
    }

    setIsValidating(true);
    setValidationResult(null);

    try {
      const res = await fetch("/api/keys/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider: currentProvider, key }),
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setValidationResult({ success: true, message: data.message });
      } else {
        setValidationResult({
          success: false,
          message: data.message || "Chave inválida. Verifique os dados copiados.",
        });
      }
    } catch {
      setValidationResult({
        success: false,
        message: "Não foi possível validar com o servidor. Verifique sua conexão.",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // ### funcao para salvar a chave no localstorage ###
  const handleSave = () => {
    const key = inputValue.trim();
    if (!key) return;
    saveKey(currentProvider, key);
    setIsSavedFeedback(true);
    setTimeout(() => {
      setIsSavedFeedback(false);
    }, 2000);
  };

  // ### funcao para remover a chave propria e reverter para cota do site ###
  const handleRemove = () => {
    removeKey(currentProvider);
    setInputValue("");
    setValidationResult(null);
  };

  return (
    // ### container modal com backdrop blur e animacao suave ###
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="card-glass rounded-3xl w-full max-w-2xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden bg-obsidian-900/95">
        {/* ### cabecalho do modal com botao de fechar ### */}
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-glow-sm flex-shrink-0">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Gerenciador de Chaves Sonora
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Use os limites gratuitos integrados ou insira sua chave própria para capacidade ilimitada.
              </p>
            </div>
          </div>
          <button
            onClick={closeModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ### aviso amigavel quando a cota gratuita for esgotada ### */}
        {modalReason && (
          <div className="mx-6 mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block text-amber-300">
                Aviso de Cota do Plano Gratuito
              </span>
              <span>{modalReason}</span>
            </div>
          </div>
        )}

        {/* ### abas dos provedores elevenlabs e groq ### */}
        <div className="px-6 pt-4 flex gap-2 border-b border-white/10">
          {(["elevenlabs", "groq"] as Provider[]).map((p) => {
            const pInfo = PROVIDERS[p];
            const hasCustom = Boolean(keys[p]);
            const isSelected = currentProvider === p;
            return (
              <button
                key={p}
                onClick={() => setCurrentProvider(p)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-sm font-semibold transition-all relative ${
                  isSelected
                    ? "text-white bg-white/[0.08] border-b-2 border-violet-500"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]"
                }`}
              >
                <span>{pInfo.name}</span>
                <span className="text-[10px] text-slate-400 font-normal">
                  ({pInfo.service})
                </span>
                {hasCustom && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                )}
              </button>
            );
          })}
        </div>

        {/* ### corpo do modal com orientacoes e inputs ### */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-300 text-sm">
          {/* ### card com status operacional atual ### */}
          <div className="p-4 rounded-2xl border border-white/10 bg-white/[0.02] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  isCustomKeyActive
                    ? "bg-emerald-400 shadow-[0_0_12px_#34d399]"
                    : "bg-indigo-400 shadow-[0_0_12px_#818cf8]"
                }`}
              />
              <div>
                <span className="text-xs text-slate-400 block">Modo em operação:</span>
                <span className="font-semibold text-white">
                  {isCustomKeyActive
                    ? `Sua chave própria de ${info.name}`
                    : `Chave gratuita integrada do Sonora`}
                </span>
              </div>
            </div>

            <div className="text-xs text-slate-400">
              {isCustomKeyActive ? (
                <span className="text-emerald-400 font-medium">Uso ilimitado (sua cota)</span>
              ) : (
                <span className="text-slate-400">{info.freeTier}</span>
              )}
            </div>
          </div>

          {/* ### guia passo a passo para criar chave gratuita ### */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-violet-400" />
              Como obter sua chave gratuita ({info.name})
            </h3>

            <div className="p-4 rounded-2xl border border-white/5 bg-black/40 space-y-2.5 text-xs text-slate-300">
              <ol className="list-decimal list-inside space-y-2">
                {info.steps.map((step, idx) => (
                  <li key={idx} className="leading-relaxed">
                    <span className="text-slate-200">{step}</span>
                  </li>
                ))}
              </ol>

              {info.permissionsNote && (
                <p className="pt-1 text-[11px] text-amber-300/90 flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{info.permissionsNote}</span>
                </p>
              )}

              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href={info.signupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-sm gap-1.5 inline-flex"
                >
                  <span>Criar conta grátis</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
                <a
                  href={info.keysUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-sm gap-1.5 inline-flex"
                >
                  <span>Abrir página de API Keys</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>
              </div>
            </div>
          </div>

          {/* ### campo de insercao de chave de api ### */}
          <div className="space-y-2">
            <label className="label justify-between">
              <span>Sua chave de API ({info.name})</span>
              {isCustomKeyActive && (
                <span className="text-xs text-slate-400 font-mono">
                  Ativa: {maskKey(keys[currentProvider] || "")}
                </span>
              )}
            </label>

            <div className="relative">
              <input
                type="password"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  setValidationResult(null);
                }}
                placeholder={`Ex.: ${info.keyPrefix}...`}
                className="input font-mono pr-28 text-xs"
              />
              <button
                type="button"
                onClick={handleTestKey}
                disabled={isValidating || !inputValue.trim()}
                className="absolute right-1.5 top-1.5 btn-secondary btn-sm text-[11px] py-1 px-3"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Testando</span>
                  </>
                ) : (
                  <span>Testar chave</span>
                )}
              </button>
            </div>

            {/* ### exibicao de diagnostico do teste da chave ### */}
            {validationResult && (
              <div
                className={`p-3 rounded-xl text-xs flex items-start gap-2.5 animate-fade-in ${
                  validationResult.success
                    ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                }`}
              >
                {validationResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                )}
                <span>{validationResult.message}</span>
              </div>
            )}
          </div>

          {/* ### termo de privacidade localstorage ### */}
          <div className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] flex items-start gap-2.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
            <span>
              <strong>Privacidade total:</strong> sua chave é gravada exclusivamente no armazenamento local do seu navegador (LocalStorage) e enviada de forma criptografada apenas nas suas próprias requisições. Ela nunca é salva no servidor.
            </span>
          </div>
        </div>

        {/* ### acoes no rodape do modal ### */}
        <div className="p-5 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            {isCustomKeyActive && (
              <button
                type="button"
                onClick={handleRemove}
                className="btn-danger btn-sm inline-flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Voltar para chave gratuita do Sonora</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary btn-sm"
            >
              Fechar
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!inputValue.trim()}
              className="btn-primary btn-sm min-w-[120px]"
            >
              {isSavedFeedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvo!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Salvar chave</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
