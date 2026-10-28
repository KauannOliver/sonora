// ### pagina inicial do portal sonora ai com landing page completa e estudios interativos ###
"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/navbar";
import { Hero } from "@/components/hero";
import { ProductsShowcase } from "@/components/products-showcase";
import { TtsGenerator } from "@/components/tts/tts-generator";
import { TranscribeStudio } from "@/components/transcribe/transcribe-studio";
import { Features } from "@/components/features";
import { HowItWorks } from "@/components/how-it-works";
import { Faq } from "@/components/faq";
import { Footer } from "@/components/footer";
import { Volume2, Mic, Layers, Sparkles } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"all" | "voice" | "scribe">("all");

  return (
    // ### container mestre da landing page sonora com fundo escuro sofisticado ###
    <div className="min-h-screen flex flex-col bg-obsidian-950 text-slate-100 selection:bg-violet-500/30 selection:text-white relative">
      {/* ### barra de navegacao superior com glassmorphism ### */}
      <Navbar />

      <main className="flex-1">
        {/* ### hero principal com animacoes de ondas e badges de novidade ### */}
        <Hero />

        {/* ### vitrine de produtos e casos de uso de alta fidelidade ### */}
        <ProductsShowcase />

        {/* ### seletor de aba interativa do estudio sonora ### */}
        <section id="estudio" className="py-12 border-t border-white/5 relative bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
          <div className="container-app">
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Estúdio Sonora em Ação</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                Experimente os motores agora mesmo
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Alterne entre síntese de voz e transcrição em lote ou visualize a suíte unificada lado a lado.
              </p>
            </div>

            {/* ### switcher de abas com efeito de iluminacao ativa ### */}
            <div className="flex items-center justify-center">
              <div className="card-glass p-1.5 rounded-2xl border border-white/10 flex flex-wrap items-center justify-center gap-1.5 shadow-2xl backdrop-blur-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab("all")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === "all"
                      ? "bg-white/[0.1] text-white shadow-sm border border-white/10"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Layers className="w-4 h-4 text-violet-400" />
                  <span>Suíte Completa</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("voice")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === "voice"
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(124,58,237,0.4)]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Volume2 className="w-4 h-4 text-violet-300" />
                  <span>Sonora Voice (TTS)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("scribe")}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === "scribe"
                      ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                  }`}
                >
                  <Mic className="w-4 h-4 text-amber-300" />
                  <span>Sonora Scribe (STT)</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ### montagem dinamica dos componentes de estudio com base na aba ativa ### */}
        {(activeTab === "all" || activeTab === "voice") && <TtsGenerator />}
        {(activeTab === "all" || activeTab === "scribe") && <TranscribeStudio />}

        {/* ### secoes informativas de arquitetura, workflow e faq ### */}
        <Features />
        <HowItWorks />
        <Faq />
      </main>

      {/* ### rodape com politicas de privacidade e status do sistema ### */}
      <Footer />
    </div>
  );
}
