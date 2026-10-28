"use client";

// ### importação de dependências react e ícones lucide ###
import React, { useState, useEffect } from "react";
import { useApiKeys } from "./api-keys/api-keys-context";
import { scrollToId } from "@/lib/utils";
import { APP_NAME, PRODUCT_TTS, PRODUCT_STT } from "@/lib/constants";
import {
  Menu,
  X,
  Key,
  Mic,
  Volume2,
  Sparkles,
  Layers,
} from "lucide-react";

export function Navbar() {
  const { openModal, hasKey } = useApiKeys();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ### detecção de rolagem para ativar efeito backdrop no header ###
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const hasAnyCustomKey = hasKey("elevenlabs") || hasKey("groq");

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-obsidian-950/85 backdrop-blur-2xl border-b border-white/[0.08] shadow-2xl shadow-black/50"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container-app h-20 flex items-center justify-between">
        {/* ### logotipo sonora com gradiente e isotipo acústico ### */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="flex items-center gap-3.5 group"
        >
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-grad-sonora flex items-center justify-center text-white shadow-glow group-hover:scale-105 group-hover:rotate-1 transition-all duration-300">
              <span className="font-bold text-xl tracking-tighter">S</span>
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-obsidian-950 shadow-[0_0_8px_#34d399]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-2xl tracking-tight text-white font-display">
                {APP_NAME}
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                AI Studio
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block -mt-1 font-medium tracking-wide">
              Ecossistema Vocal Inteligente
            </span>
          </div>
        </a>

        {/* ### navegação desktop para os produtos e recursos ### */}
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
          <button
            onClick={() => handleNavClick("estudio-voice")}
            className="hover:text-white transition-colors flex items-center gap-2 py-1"
          >
            <div className="w-6 h-6 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
              <Volume2 className="w-3.5 h-3.5" />
            </div>
            <span>{PRODUCT_TTS}</span>
          </button>

          <button
            onClick={() => handleNavClick("estudio-scribe")}
            className="hover:text-white transition-colors flex items-center gap-2 py-1"
          >
            <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
              <Mic className="w-3.5 h-3.5" />
            </div>
            <span>{PRODUCT_STT}</span>
          </button>

          <button
            onClick={() => handleNavClick("produtos")}
            className="hover:text-white transition-colors flex items-center gap-1.5"
          >
            <Layers className="w-4 h-4 text-slate-400" />
            <span>Produtos</span>
          </button>

          <button
            onClick={() => handleNavClick("recursos")}
            className="hover:text-white transition-colors"
          >
            Recursos
          </button>

          <button
            onClick={() => handleNavClick("faq")}
            className="hover:text-white transition-colors"
          >
            FAQ
          </button>
        </nav>

        {/* ### botões de ação e gerenciamento de chaves no desktop ### */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={() => openModal()}
            className="glass-button text-xs py-2 px-3.5 rounded-xl border border-white/10"
            title="Configurar suas chaves de API personalizadas"
          >
            <Key className="w-3.5 h-3.5 text-violet-400" />
            <span>Chaves de API</span>
            <span
              className={`w-2 h-2 rounded-full ml-1 ${
                hasAnyCustomKey
                  ? "bg-emerald-400 shadow-[0_0_10px_#34d399]"
                  : "bg-indigo-400 shadow-[0_0_8px_#818cf8]"
              }`}
            />
          </button>

          <button
            type="button"
            onClick={() => handleNavClick("estudio-voice")}
            className="btn-primary text-xs py-2.5 px-4 rounded-xl"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Explorar Estúdios</span>
          </button>
        </div>

        {/* ### gatilho do menu mobile ### */}
        <div className="flex lg:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => openModal()}
            className="p-2 rounded-xl glass-button text-violet-400"
            aria-label="Chaves de API"
          >
            <Key className="w-4 h-4" />
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={mobileMenuOpen ? "Fechar navegação" : "Abrir navegação"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* ### drawer responsivo para dispositivos móveis ### */}
      {mobileMenuOpen && (
        <div className="lg:hidden glass-card border-x-0 rounded-none border-b border-white/10 px-6 pt-4 pb-7 space-y-4 animate-fade-in bg-obsidian-950/95">
          <button
            onClick={() => handleNavClick("estudio-voice")}
            className="flex items-center gap-3 w-full text-left py-2.5 text-sm font-semibold text-slate-100 hover:text-violet-400 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 border border-violet-500/20">
              <Volume2 className="w-4 h-4" />
            </div>
            <span>{PRODUCT_TTS} (Síntese Neural)</span>
          </button>

          <button
            onClick={() => handleNavClick("estudio-scribe")}
            className="flex items-center gap-3 w-full text-left py-2.5 text-sm font-semibold text-slate-100 hover:text-orange-400 transition-colors"
          >
            <div className="w-7 h-7 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20">
              <Mic className="w-4 h-4" />
            </div>
            <span>{PRODUCT_STT} (Transcrição Verbatim)</span>
          </button>

          <button
            onClick={() => handleNavClick("produtos")}
            className="block w-full text-left py-2 text-sm text-slate-300 hover:text-white"
          >
            Comparativo de Produtos
          </button>

          <button
            onClick={() => handleNavClick("recursos")}
            className="block w-full text-left py-2 text-sm text-slate-300 hover:text-white"
          >
            Diferenciais Tecnológicos
          </button>

          <button
            onClick={() => handleNavClick("faq")}
            className="block w-full text-left py-2 text-sm text-slate-300 hover:text-white"
          >
            Perguntas Frequentes & Cotas
          </button>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openModal();
              }}
              className="glass-button w-full text-xs justify-center gap-2 py-2.5"
            >
              <Key className="w-4 h-4 text-violet-400" />
              <span>Gerenciar Chaves de API</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
