// ### importação de tipos do next e fontes do google ###
import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono, Outfit } from "next/font/google";
import "./globals.css";
import { ApiKeysProvider } from "@/components/api-keys/api-keys-context";
import { ApiKeysModal } from "@/components/api-keys/api-keys-modal";

// ### configuração das fontes do design system sonora ###
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

// ### metadados de seo e compartilhamento social ###
export const metadata: Metadata = {
  title: "Sonora — Ecossistema de Inteligência Vocal",
  description:
    "Sonora Voice (Síntese Neural ElevenLabs) e Sonora Scribe (Transcrição Verbatim Groq Whisper Large V3). Alta fidelidade em Português do Brasil com cotas integradas e suporte a chaves próprias.",
  keywords: [
    "sonora",
    "sonora voice",
    "sonora scribe",
    "inteligencia vocal",
    "text to speech brasil",
    "transcricao verbatim",
    "whisper large v3",
    "groq lpu",
    "elevenlabs pt-br",
    "ia de audio",
  ],
  authors: [{ name: "Sonora Studio" }],
  openGraph: {
    title: "Sonora — Ecossistema de Inteligência Vocal",
    description:
      "A nova era da fala humana e transcrição de áudio com ElevenLabs e Groq Whisper Large V3.",
    type: "website",
    locale: "pt_BR",
  },
};

// ### configuração da viewport e tema mobile ###
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#05070C",
};

// ### layout raiz com injeção global de provedores e modais ###
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${jakarta.variable} ${outfit.variable} ${mono.variable}`}>
      <body className="font-sans antialiased bg-obsidian-950 text-slate-100 min-h-screen flex flex-col selection:bg-violet-600/40 selection:text-white">
        {/* ### provedor de contexto de chaves e modal global ### */}
        <ApiKeysProvider>
          {children}
          <ApiKeysModal />
        </ApiKeysProvider>
      </body>
    </html>
  );
}
