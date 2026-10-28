// ### contexto global de gerenciamento de chaves de api e monitoramento de cotas ###
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { STORAGE_KEYS, USER_KEY_HEADERS } from "@/lib/constants";
import type { Provider, UsageResponse } from "@/types/api";

export interface UserKeys {
  elevenlabs?: string;
  groq?: string;
}

interface ApiKeysContextType {
  keys: UserKeys;
  hasKey: (provider: Provider) => boolean;
  saveKey: (provider: Provider, key: string) => void;
  removeKey: (provider: Provider) => void;
  getKeyHeaders: () => Record<string, string>;
  isModalOpen: boolean;
  activeProvider: Provider;
  modalReason: string | null;
  openModal: (provider?: Provider, reason?: string) => void;
  closeModal: () => void;
  usage: UsageResponse | null;
  isLoadingUsage: boolean;
  refreshUsage: () => Promise<void>;
}

const ApiKeysContext = createContext<ApiKeysContextType | null>(null);

export function ApiKeysProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeys] = useState<UserKeys>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProvider, setActiveProvider] = useState<Provider>("elevenlabs");
  const [modalReason, setModalReason] = useState<string | null>(null);
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [isLoadingUsage, setIsLoadingUsage] = useState(false);

  // ### carregar chaves salvas no localstorage ao montar o componente ###
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER_KEYS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "object" && parsed !== null) {
          setKeys(parsed);
        }
      }
    } catch (e) {
      console.warn("Falha ao ler chaves do LocalStorage:", e);
    }
  }, []);

  // ### busca atualizada das cotas gratuitas restantes via api ###
  const refreshUsage = useCallback(async () => {
    setIsLoadingUsage(true);
    try {
      const res = await fetch("/api/usage", { cache: "no-store" });
      if (res.ok) {
        const data: UsageResponse = await res.json();
        setUsage(data);
      }
    } catch (e) {
      console.warn("Erro ao buscar cotas de uso:", e);
    } finally {
      setIsLoadingUsage(false);
    }
  }, []);

  // ### executa consulta de cotas na inicializacao ###
  useEffect(() => {
    refreshUsage();
  }, [refreshUsage]);

  // ### salvar chave no estado e persistir no localstorage ###
  const saveKey = (provider: Provider, key: string) => {
    const trimmed = key.trim();
    const updated = { ...keys, [provider]: trimmed };
    setKeys(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_KEYS, JSON.stringify(updated));
    } catch (e) {
      console.warn("Erro ao salvar chave:", e);
    }
  };

  // ### remover chave do provedor e voltar para cota do site ###
  const removeKey = (provider: Provider) => {
    const updated = { ...keys };
    delete updated[provider];
    setKeys(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_KEYS, JSON.stringify(updated));
    } catch (e) {
      console.warn("Erro ao remover chave:", e);
    }
    refreshUsage();
  };

  // ### verificar se o usuario possui chave propria ativa ###
  const hasKey = (provider: Provider) => {
    const val = keys[provider];
    return typeof val === "string" && val.trim().length > 0;
  };

  // ### gerar headers de autenticacao para encaminhar chave personalizada ###
  const getKeyHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = {};
    if (keys.elevenlabs) {
      headers[USER_KEY_HEADERS.elevenlabs] = keys.elevenlabs;
    }
    if (keys.groq) {
      headers[USER_KEY_HEADERS.groq] = keys.groq;
    }
    return headers;
  };

  // ### abrir modal de configuracao de chaves com motivo opcional ###
  const openModal = (provider: Provider = "elevenlabs", reason?: string) => {
    setActiveProvider(provider);
    setModalReason(reason || null);
    setIsModalOpen(true);
  };

  // ### fechar modal e limpar motivo ###
  const closeModal = () => {
    setIsModalOpen(false);
    setModalReason(null);
  };

  return (
    <ApiKeysContext.Provider
      value={{
        keys,
        hasKey,
        saveKey,
        removeKey,
        getKeyHeaders,
        isModalOpen,
        activeProvider,
        modalReason,
        openModal,
        closeModal,
        usage,
        isLoadingUsage,
        refreshUsage,
      }}
    >
      {children}
    </ApiKeysContext.Provider>
  );
}

// ### hook para consumo facil do contexto de chaves em componentes ###
export function useApiKeys() {
  const ctx = useContext(ApiKeysContext);
  if (!ctx) {
    throw new Error("useApiKeys deve ser usado dentro de um ApiKeysProvider");
  }
  return ctx;
}
