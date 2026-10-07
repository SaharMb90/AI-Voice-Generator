export interface VoicePersona {
  id: string;
  name: string;
  title: string;
  origin: string;
  voiceName: 'Puck' | 'Charon' | 'Kore' | 'Fenrir' | 'Zephyr';
  gender: 'male' | 'female';
  avatar: string;
  tagline: string;
  description: string;
  recommendedIntensity: 'subtle' | 'authentic' | 'passionate';
  samplePreviewText: string;
}

export interface GeneratedVoice {
  id: string;
  text: string;
  audioBase64: string;
  mimeType: string;
  voiceName: string;
  personaId: string;
  personaName: string;
  languageMode: 'english-italian-accent' | 'italian-native';
  intensity: 'subtle' | 'authentic' | 'passionate';
  timestamp: number;
  duration?: number;
}

export interface ScriptPreset {
  id: string;
  title: string;
  category: 'cucina' | 'dolce-vita' | 'travel' | 'cinematic' | 'espresso' | 'native';
  personaId: string;
  languageMode: 'english-italian-accent' | 'italian-native';
  intensity: 'subtle' | 'authentic' | 'passionate';
  text: string;
  subtitle: string;
}
