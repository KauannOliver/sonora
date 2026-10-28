export interface TranscriptSegment {
  id?: number;
  start: number;
  end: number;
  text: string;
}

export interface TranscriptionResult {
  filename: string;
  filesize: number;
  duration: number | null;
  language: string;
  text: string;
  segments: TranscriptSegment[];
  elapsedSeconds: string;
  keyUsed: string;
  timestamp: string;
  failed?: boolean;
}

export interface TranscriptionHistoryItem extends TranscriptionResult {
  id: string;
  savedAt: string;
}
