/** Server defaults are supplied only through the local runtime environment. */
export interface NamedKey {
  name: string;
  key: string;
}

function isUsable(value: string | undefined): value is string {
  if (!value) return false;
  const trimmed = value.trim();
  return trimmed.length > 10 && !/placeholder|your[-_ ]|replace[-_ ]/i.test(trimmed);
}

export function getDefaultElevenLabsKey(): string | null {
  const value = process.env.ELEVENLABS_API_KEY;
  return isUsable(value) ? value.trim() : null;
}

export function getDefaultGroqKeys(): NamedKey[] {
  return (process.env.GROQ_API_KEYS ?? process.env.GROQ_API_KEY ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(isUsable)
    .map((key, index) => ({ name: `Configured Groq key ${index + 1}`, key }));
}
