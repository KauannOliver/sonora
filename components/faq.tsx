// ### componente de perguntas frequentes do portal sonora ###
"use client";

import React, { useState } from "react";
import { useApiKeys } from "./api-keys/api-keys-context";
import { ChevronDown, ChevronUp, Key, HelpCircle, Sparkles } from "lucide-react";

// ### lista de questoes frequentes sobre sonora cotas e integracoes ###
const FAQS = [
  {
    q: "O que é o ecossistema Sonora?",
    a: "O Sonora é um portal avançado de áudio com inteligência artificial que unifica duas soluções essenciais: Sonora Voice (síntese de texto em voz hiper-realista com ElevenLabs Multilingual v2) e Sonora Scribe (transcrição em lote acelerada por hardware Groq com Whisper Large v3 e fidelidade verbatim).",
  },
  {
    q: "Como funciona o limite gratuito diário?",
    a: "Cada visitante possui uma cota gratuita diária integrada: até 1.000 caracteres de síntese de voz no Sonora Voice e até 10 transcrições de áudio no Sonora Scribe. Essa cota é renovada diariamente à meia-noite UTC sem você precisar pagar nada.",
  },
  {
    q: "O que acontece quando meu limite gratuito se esgota?",
    a: "Quando o limite diário gratuito for atingido ou as chaves compartilhadas estiverem ocupadas, uma notificação inteligente convida você a inserir sua chave gratuita própria (BYOK - Bring Your Own Key) da ElevenLabs ou da Groq. Você continuará usando o Sonora sem nenhuma interrupção.",
  },
  {
    q: "Onde posso gerar minhas chaves de API gratuitas?",
    a: "Você pode abrir o Gerenciador de Chaves no topo da página a qualquer instante. Para o Sonora Scribe, acesse console.groq.com e gere uma chave gratuita (iniciada em gsk_). Para o Sonora Voice, acesse elevenlabs.io em Settings → API Keys e crie uma chave gratuita (iniciada em sk_). Ambas oferecem tiers gratuitos generosos para novos usuários.",
  },
  {
    q: "Minhas chaves de API e arquivos de áudio ficam seguros?",
    a: "Completamente seguros. O Sonora opera sob arquitetura client-first: suas chaves pessoais são salvas exclusivamente no LocalStorage do seu próprio navegador. Nenhum arquivo de áudio ou texto sintetizado é persistido em servidores.",
  },
  {
    q: "O Sonora Scribe censura gírias, interjeições ou palavrões?",
    a: "Não! O motor Whisper Large v3 opera com calibração profunda para o Português do Brasil em modo 100% verbatim. Cada expressão coloquial, sotaque regional, interjeição e termo informal é fielmente registrado sem nenhuma autocensura.",
  },
  {
    q: "Como recebo o arquivo consolidado de transcrições?",
    a: "Ao enviar até 10 áudios para transcrição em lote, o Sonora Scribe processa os arquivos em fila contínua e, assim que o lote termina, dispara o download automático de um arquivo .txt consolidado contendo cabeçalho estruturado, sumário e marcação temporal por segmento de fala.",
  },
];

export function Faq() {
  const { openModal } = useApiKeys();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    // ### secao principal de faq com acordeon interativo ###
    <section id="faq" className="py-20 md:py-28 relative border-t border-white/5 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent">
      <div className="container-app">
        {/* ### cabecalho da secao de perguntas frequentes ### */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-semibold tracking-wide">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Central de Dúvidas</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white">
            Perguntas <span className="gradient-text">Frequentes</span>
          </h2>
          <p className="text-base text-slate-400">
            Tudo o que você precisa saber sobre o Sonora, limites gratuitos e suporte a chaves próprias.
          </p>
        </div>

        {/* ### lista de itens do acordeon ### */}
        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="card-glass border border-white/5 hover:border-white/15 overflow-hidden transition-all rounded-2xl"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-white text-sm sm:text-base hover:text-violet-200 transition-colors"
                >
                  <span>{faq.q}</span>
                  <div className={`w-8 h-8 rounded-full border border-white/10 flex items-center justify-center flex-shrink-0 transition-colors ${isOpen ? "bg-violet-600/20 text-violet-300 border-violet-500/30" : "bg-white/[0.02] text-slate-500"}`}>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* ### card cta para ativacao rapida de chaves de api ### */}
        <div className="mt-14 max-w-xl mx-auto text-center">
          <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-r from-violet-950/30 to-amber-950/20 space-y-4">
            <div className="flex items-center justify-center gap-2 text-violet-300 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Controle total de uso</span>
            </div>
            <h4 className="text-base font-bold text-white">Pronto para acelerar seus projetos de áudio?</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Use a cota gratuita agora ou adicione suas credenciais pessoais para volume ilimitado.
            </p>
            <button
              type="button"
              onClick={() => openModal()}
              className="btn-primary btn-sm inline-flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Configurar Chaves de API</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
