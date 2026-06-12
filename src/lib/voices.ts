export type VoiceOption = {
  id: string;
  label: string;
  description: string;
  language: "nepali" | "hindi";
  gender: "male" | "female";
};

export const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: "ne-NP-Standard-B",
    label: "Nepali Male",
    description: "Authoritative",
    language: "nepali",
    gender: "male",
  },
  {
    id: "ne-NP-Standard-A",
    label: "Nepali Female",
    description: "Warm, cultural",
    language: "nepali",
    gender: "female",
  },
  {
    id: "hi-IN-Neural2-C",
    label: "Hindi Male",
    description: "News anchor",
    language: "hindi",
    gender: "male",
  },
  {
    id: "hi-IN-Neural2-D",
    label: "Hindi Female",
    description: "Storyteller",
    language: "hindi",
    gender: "female",
  },
];

export function defaultVoiceForLanguage(language: string, nicheDefault?: string): string {
  if (nicheDefault && VOICE_OPTIONS.some((v) => v.id === nicheDefault)) {
    return nicheDefault;
  }
  if (language === "hindi") return "hi-IN-Neural2-C";
  return "ne-NP-Standard-B";
}

export function getVoiceOption(voiceId: string): VoiceOption | undefined {
  return VOICE_OPTIONS.find((v) => v.id === voiceId);
}
