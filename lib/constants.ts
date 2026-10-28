// ### importação de tipos para configuração e provedores ###
import type { ClientVoiceSettings } from "@/types/elevenlabs";
import type { Provider } from "@/types/api";

// ### nome da plataforma e submarcas ###
export const APP_NAME = "Sonora";
export const APP_TAGLINE = "Ecossistema de Inteligência Vocal";
export const PRODUCT_TTS = "Sonora Voice";
export const PRODUCT_STT = "Sonora Scribe";

// ### configurações do motor de síntese neural elevenlabs ###
export const TTS_CONFIG = {
  modelId: "eleven_multilingual_v2",
  outputFormat: "mp3_44100_128",
  maxCharacters: 10000,
  defaultSettings: {
    stability: 0.5,
    similarityBoost: 0.75,
    style: 0,
    useSpeakerBoost: true,
    speed: 1.0,
  } as ClientVoiceSettings,
};

// ### configurações do motor de transcrição groq whisper large v3 ###
export const TRANSCRIBE_CONFIG = {
  model: "whisper-large-v3",
  language: "pt",
  temperature: 0,
  responseFormat: "verbose_json",
  prompt:
    "Transcrição verbatim e literal em português do Brasil (PT-BR). Capture exatamente cada palavra dita, incluindo gírias brasileiras, termos informais, expressões coloquiais, vícios de linguagem e palavrões, sem censura, sem omissões e sem suavização.",
  maxFiles: 10,
  maxFileBytes: 25 * 1024 * 1024,
  allowedExtensions: [".mp3", ".wav", ".m4a", ".ogg", ".webm", ".flac", ".mp4", ".mpeg", ".mpga"],
};

// ### chaves de persistência local no navegador ###
export const STORAGE_KEYS = {
  DRAFT_TEXT: "sonora_draft_text",
  SELECTED_VOICE_ID: "sonora_selected_voice_id",
  VOICE_SETTINGS: "sonora_voice_settings",
  TTS_HISTORY: "sonora_tts_history",
  TRANSCRIPTIONS: "sonora_transcriptions_history",
  USER_KEYS: "sonora_user_api_keys",
} as const;

// ### cabeçalhos http para injeção de chaves personalizadas ###
export const USER_KEY_HEADERS: Record<Provider, string> = {
  elevenlabs: "x-user-elevenlabs-key",
  groq: "x-user-groq-key",
};

// ### dados e instruções para obtenção de chaves de api nos provedores ###
export interface ProviderInfo {
  id: Provider;
  name: string;
  service: string;
  badge: string;
  keyPrefix: string;
  signupUrl: string;
  keysUrl: string;
  pricingUrl: string;
  freeTier: string;
  steps: string[];
  permissionsNote?: string;
}

export const PROVIDERS: Record<Provider, ProviderInfo> = {
  elevenlabs: {
    id: "elevenlabs",
    name: "ElevenLabs",
    service: "Sonora Voice (Texto → Voz)",
    badge: "Síntese Neural",
    keyPrefix: "sk_",
    signupUrl: "https://elevenlabs.io/app/sign-up",
    keysUrl: "https://elevenlabs.io/app/settings/api-keys",
    pricingUrl: "https://elevenlabs.io/pricing",
    freeTier: "Plano Free: ~10.000 créditos mensais gratuitos (≈ 10 mil caracteres).",
    steps: [
      "Acesse elevenlabs.io e crie uma conta gratuita (ou faça login).",
      "No menu lateral esquerdo, vá em Developers → API Keys.",
      "Clique em “Create API Key”, defina um nome e marque as permissões “Text to Speech” e “Voices → Read”.",
      "Copie a chave gerada (inicia com sk_) e cole no campo de configuração.",
    ],
    permissionsNote:
      "Atenção: se criar uma chave restrita, certifique-se de habilitar Text to Speech e leitura de vozes.",
  },
  groq: {
    id: "groq",
    name: "Groq LPU",
    service: "Sonora Scribe (Voz → Texto)",
    badge: "Whisper Large V3",
    keyPrefix: "gsk_",
    signupUrl: "https://console.groq.com/login",
    keysUrl: "https://console.groq.com/keys",
    pricingUrl: "https://console.groq.com/settings/limits",
    freeTier: "Plano Free: gratuito com alta taxa por minuto/dia (≈ 2.000 requisições/dia).",
    steps: [
      "Acesse console.groq.com e faça login com Google, GitHub ou e-mail.",
      "No menu lateral, selecione API Keys.",
      "Clique no botão “Create API Key” e dê um nome descritivo (ex.: Sonora Studio).",
      "Copie a chave exibida (inicia com gsk_) e cole no campo abaixo.",
    ],
  },
};
