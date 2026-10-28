export interface ClientVoiceSettings {
  stability: number;
  similarityBoost: number;
  style: number;
  useSpeakerBoost: boolean;
  speed: number;
}

export interface VerifiedLanguage {
  language?: string;
  model_id?: string;
  accent?: string;
  locale?: string;
  preview_url?: string;
}

export interface VoiceItem {
  voiceId: string;
  name: string;
  category?: string;
  description?: string;
  labels?: Record<string, string>;
  previewUrl?: string | null;
  verifiedLanguages?: VerifiedLanguage[];
  isPtBr: boolean;
  gender?: string;
  accent?: string;
  useCase?: string;
}

export interface GenerateSpeechParams {
  text: string;
  voiceId: string;
  voiceSettings?: Partial<ClientVoiceSettings>;
}

export interface VoicesApiResponse {
  voices: VoiceItem[];
  hasPtBr: boolean;
}

export interface GenerationHistoryItem {
  id: string;
  text: string;
  voiceId: string;
  voiceName: string;
  characterCount: number;
  createdAt: string;
  settings: ClientVoiceSettings;
}
