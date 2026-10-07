import { useState, useEffect } from 'react';
import { PERSONAS, SCRIPT_PRESETS, ITALIAN_GESTURE_TAGS } from './data/personasAndPresets';
import { VoicePersona, GeneratedVoice, ScriptPreset } from './types';
import { PersonaSelector } from './components/PersonaSelector';
import { AudioPlayer } from './components/AudioPlayer';
import { ItalianizerModal } from './components/ItalianizerModal';
import { PresetLibrary } from './components/PresetLibrary';
import { HistoryList } from './components/HistoryList';
import {
  Mic2,
  Sparkles,
  Volume2,
  Wand2,
  Sliders,
  RotateCcw,
  BookOpen,
  History,
  AlertCircle,
  Loader2,
  Flame,
  ChevronDown,
  Info
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'studio' | 'presets' | 'history'>('studio');
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(PERSONAS[0]);
  const [text, setText] = useState<string>(
    'Buongiorno! Welcome to our little trattoria in the heart of Rome. Today we have fresh hand-made tagliatelle with white truffles, and a beautiful bottle of Chianti. Mamma mia, let me pour you a glass!'
  );
  const [languageMode, setLanguageMode] = useState<'english-italian-accent' | 'italian-native'>('english-italian-accent');
  const [intensity, setIntensity] = useState<'subtle' | 'authentic' | 'passionate'>('authentic');
  const [selectedVoice, setSelectedVoice] = useState<string>(PERSONAS[0].voiceName);
  const [ttsModel, setTtsModel] = useState<'gemini-3.8-flash-lite-tts' | 'gemini-3.8-flash-tts'>('gemini-3.8-flash-lite-tts');
  const [customStyle, setCustomStyle] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [activeAudio, setActiveAudio] = useState<GeneratedVoice | null>(null);
  const [history, setHistory] = useState<GeneratedVoice[]>([]);
  const [isItalianizerOpen, setIsItalianizerOpen] = useState(false);
  const [loadingQuoteIndex, setLoadingQuoteIndex] = useState(0);

  const loadingQuotes = [
    'Rolling the "r" with Mediterranean passion...',
    'Brewing a rich Roman espresso for the vocal cords...',
    'Tuning the melodic cadence of Italian phrasing...',
    'Adding hand-gestures into the soundwave...',
    'Perfecting the intonation, just like in Trastevere...',
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setLoadingQuoteIndex((prev) => (prev + 1) % loadingQuotes.length);
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Sync voice when persona changes
  const handleSelectPersona = (persona: VoicePersona) => {
    setSelectedPersona(persona);
    setSelectedVoice(persona.voiceName);
    setIntensity(persona.recommendedIntensity);
  };

  const handleInsertTag = (tag: string) => {
    setText((prev) => {
      const trimmed = prev.trim();
      return trimmed ? `${trimmed} ${tag} ` : `${tag} `;
    });
  };

  const handleGenerateVoice = async (overrideText?: string, overridePersona?: VoicePersona) => {
    const textToUse = (overrideText || text).trim();
    if (!textToUse) {
      setGenerationError('Please enter some text to speak.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    const personaToUse = overridePersona || selectedPersona;

    try {
      const response = await fetch('/api/voice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToUse,
          voiceName: selectedVoice,
          persona: personaToUse.id,
          languageMode,
          intensity,
          customStyle: customStyle.trim() || undefined,
          model: ttsModel,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate voice.');
      }

      const newVoice: GeneratedVoice = {
        id: `voice-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        text: textToUse,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        voiceName: data.voiceName,
        personaId: personaToUse.id,
        personaName: personaToUse.name,
        languageMode,
        intensity,
        timestamp: Date.now(),
      };

      setActiveAudio(newVoice);
      setHistory((prev) => [newVoice, ...prev]);

      // If user was on another tab, bring them to studio to hear it
      if (activeTab !== 'studio') {
        setActiveTab('studio');
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      setGenerationError(err?.message || 'Failed to generate voice. Please verify network connection.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPreset = (preset: ScriptPreset, autoGenerate = false) => {
    const matchedPersona = PERSONAS.find((p) => p.id === preset.personaId) || PERSONAS[0];
    setSelectedPersona(matchedPersona);
    setSelectedVoice(matchedPersona.voiceName);
    setText(preset.text);
    setLanguageMode(preset.languageMode);
    setIntensity(preset.intensity);

    if (autoGenerate) {
      handleGenerateVoice(preset.text, matchedPersona);
    } else {
      setActiveTab('studio');
    }
  };

  const handleRandomPreset = () => {
    const random = SCRIPT_PRESETS[Math.floor(Math.random() * SCRIPT_PRESETS.length)];
    handleSelectPreset(random, false);
  };

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans">
      {/* Italian Flag Strip */}
      <div className="h-1.5 w-full grid grid-cols-3">
        <div className="bg-emerald-600" />
        <div className="bg-stone-200" />
        <div className="bg-red-600" />
      </div>

      {/* Header Bar */}
      <header className="border-b border-stone-800/80 bg-stone-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-stone-950 font-bold shadow-md shadow-amber-500/20">
              <Mic2 className="w-5 h-5 text-stone-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white flex items-center gap-1.5 font-serif">
                  Voce d'Italia
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Italian TTS
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Italian-Accented Voice Generator • Gemini 3.8 Speech Studio
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1.5 bg-stone-900/90 p-1 rounded-xl border border-stone-800">
            <button
              onClick={() => setActiveTab('studio')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'studio'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <Mic2 className="w-3.5 h-3.5" />
              <span>Voice Studio</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'presets'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Presets & Scripts</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'history'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
              {history.length > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === 'history' ? 'bg-stone-950 text-amber-300' : 'bg-stone-800 text-stone-300'
                }`}>
                  {history.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
        {/* Intro banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/30 via-stone-900 to-stone-900 border border-amber-500/20 p-5 sm:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Authentic Italian Cadence & Accent
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white font-serif">
                Generate Natural Italian-Accented Speech
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                Whether you need a charming Italian accent speaking English for videos and voiceovers, or melodic native Italian speech, Voce d'Italia uses custom voice styling with Gemini 3.8 TTS.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleRandomPreset}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                <span>Try Random Script</span>
              </button>
              <button
                onClick={() => setIsItalianizerOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Script Coach</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Voice Studio */}
        {activeTab === 'studio' && (
          <div className="space-y-6">
            {/* Active Audio Player if one is generated */}
            {activeAudio && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4" /> Latest Generation Ready to Play
                  </span>
                </div>
                <AudioPlayer voice={activeAudio} />
              </div>
            )}

            {/* Persona Selector */}
            <div className="rounded-2xl bg-stone-900/60 border border-stone-800/80 p-5">
              <PersonaSelector
                selectedPersonaId={selectedPersona.id}
                onSelectPersona={handleSelectPersona}
                onUseSampleText={(sample) => setText(sample)}
              />
            </div>

            {/* Script Text Input & Controls */}
            <div className="rounded-2xl bg-stone-900/80 border border-stone-800 p-5 sm:p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <label className="text-sm font-semibold text-stone-200 flex items-center gap-2">
                  <span>Script & Text Prompt</span>
                  <span className="text-xs text-stone-500 font-normal">
                    (Write in English for Italian accent, or in Italian)
                  </span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsItalianizerOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 transition"
                  >
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Italianize Text with AI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setText('')}
                    className="text-xs text-stone-400 hover:text-stone-200 px-2 py-1 transition"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Textarea */}
              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Type what you want the Italian voice to say... e.g., 'Welcome to Rome, my friends! Today we taste the finest olive oil and fresh bread.'"
                  rows={4}
                  className="w-full rounded-xl bg-stone-950 border border-stone-800 p-4 text-stone-100 text-sm leading-relaxed focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-y font-serif placeholder:font-sans placeholder:text-stone-600"
                />
                <div className="text-[11px] text-stone-500 text-right mt-1 font-mono">
                  {text.length} / 2500 characters
                </div>
              </div>

              {/* Quick Italian Gestures & Vocal Cues */}
              <div>
                <span className="text-xs font-semibold text-stone-400 block mb-2">
                  Quick Italian Expressions & Cues (Click to insert):
                </span>
                <div className="flex flex-wrap gap-2">
                  {ITALIAN_GESTURE_TAGS.map((g) => (
                    <button
                      key={g.tag}
                      type="button"
                      onClick={() => handleInsertTag(g.tag)}
                      title={g.desc}
                      className="px-2.5 py-1 rounded-lg text-xs bg-stone-800/80 hover:bg-stone-700 hover:text-amber-300 text-stone-300 border border-stone-700/80 transition active:scale-95 flex items-center gap-1 font-mono"
                    >
                      <span>{g.tag}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Voice Styling Controls Bar */}
              <div className="pt-4 border-t border-stone-800 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Language Mode */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-2 uppercase tracking-wider">
                    Accent / Language Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLanguageMode('english-italian-accent')}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                        languageMode === 'english-italian-accent'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      🇮🇹 Italian Accent
                      <span className="block text-[10px] text-stone-400 font-normal mt-0.5">English Speech</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLanguageMode('italian-native')}
                      className={`p-2.5 rounded-xl text-xs font-medium border text-center transition ${
                        languageMode === 'italian-native'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200 font-bold'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                      }`}
                    >
                      🇮🇹 Native Italian
                      <span className="block text-[10px] text-stone-400 font-normal mt-0.5">Italian Language</span>
                    </button>
                  </div>
                </div>

                {/* Accent Intensity */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-2 uppercase tracking-wider">
                    Accent Intensity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['subtle', 'authentic', 'passionate'] as const).map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setIntensity(lvl)}
                        className={`p-2.5 rounded-xl text-xs font-medium capitalize border text-center transition ${
                          intensity === lvl
                            ? 'bg-amber-500 text-stone-950 font-bold border-amber-500'
                            : 'bg-stone-950 border-stone-800 text-stone-400 hover:border-stone-700'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prebuilt Voice Name */}
                <div>
                  <label className="text-xs font-semibold text-stone-300 block mb-2 uppercase tracking-wider">
                    Base Gemini Voice
                  </label>
                  <select
                    value={selectedVoice}
                    onChange={(e) => setSelectedVoice(e.target.value)}
                    className="w-full h-[42px] px-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Puck">Puck (Warm, energetic, playful - Male)</option>
                    <option value="Charon">Charon (Deep, resonant, dramatic - Male)</option>
                    <option value="Kore">Kore (Clear, soothing, warm - Female)</option>
                    <option value="Zephyr">Zephyr (Bright, stylish, airy - Female)</option>
                    <option value="Fenrir">Fenrir (Authoritative, robust - Male)</option>
                  </select>
                </div>
              </div>

              {/* Advanced Controls Toggle */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-200 font-medium"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Advanced Voice Design Options</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                </button>

                {showAdvanced && (
                  <div className="mt-3 p-4 rounded-xl bg-stone-950/70 border border-stone-800 space-y-3 animate-in fade-in">
                    <div>
                      <label className="text-xs font-semibold text-stone-300 block mb-1">
                        TTS Model Engine
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setTtsModel('gemini-3.8-flash-lite-tts')}
                          className={`p-2.5 rounded-lg text-xs text-left border ${
                            ttsModel === 'gemini-3.8-flash-lite-tts'
                              ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 font-semibold'
                              : 'bg-stone-900 border-stone-800 text-stone-400'
                          }`}
                        >
                          <span className="block font-bold">gemini-3.8-flash-lite-tts</span>
                          <span className="text-[10px] text-stone-400">Fast, low-latency standard TTS</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTtsModel('gemini-3.8-flash-tts')}
                          className={`p-2.5 rounded-lg text-xs text-left border ${
                            ttsModel === 'gemini-3.8-flash-tts'
                              ? 'bg-amber-500/15 border-amber-500/60 text-amber-200 font-semibold'
                              : 'bg-stone-900 border-stone-800 text-stone-400'
                          }`}
                        >
                          <span className="block font-bold">gemini-3.8-flash-tts</span>
                          <span className="text-[10px] text-stone-400">Flagship voice design & backchanneling</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-stone-300 block mb-1">
                        Custom Voice Style Override (Optional)
                      </label>
                      <input
                        type="text"
                        value={customStyle}
                        onChange={(e) => setCustomStyle(e.target.value)}
                        placeholder="e.g. Jovial Italian pizzaiolo from Salerno with playful giggles and warm Mediterranean laugh"
                        className="w-full px-3 py-2 rounded-lg bg-stone-900 border border-stone-800 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[11px] text-stone-500 mt-1">
                        Leave blank to use the curated persona style prompt automatically.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error message */}
              {generationError && (
                <div className="p-4 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Generation Failed</strong>
                    <span>{generationError}</span>
                  </div>
                </div>
              )}

              {/* Main Generate Button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerateVoice()}
                  disabled={isGenerating || !text.trim()}
                  className="w-full py-4 rounded-xl text-base font-bold bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 shadow-xl shadow-amber-500/25 transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                      <span>{loadingQuotes[loadingQuoteIndex]}</span>
                    </>
                  ) : (
                    <>
                      <Flame className="w-5 h-5 text-stone-950 fill-stone-950" />
                      <span>Generate Italian Voice with {selectedPersona.name}</span>
                      <Sparkles className="w-4 h-4 text-stone-950/80" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Presets & Scripts */}
        {activeTab === 'presets' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Italian Script & Monologue Library
                </h3>
                <p className="text-xs text-stone-400">
                  Carefully written scripts optimized for authentic Italian cadence, emotional rhythm, and cultural flavor.
                </p>
              </div>
            </div>

            <PresetLibrary onSelectPreset={handleSelectPreset} />
          </div>
        )}

        {/* Tab 3: Generation History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-serif">
                  Audio Generations History
                </h3>
                <p className="text-xs text-stone-400">
                  Access and re-download all Italian voice clips created during your current session.
                </p>
              </div>
            </div>

            <HistoryList
              history={history}
              onPlayVoice={(voice) => {
                setActiveAudio(voice);
                setActiveTab('studio');
              }}
              onClearHistory={() => setHistory([])}
            />
          </div>
        )}

        {/* Educational / Accent Tips Footer Card */}
        <div className="rounded-2xl bg-stone-900/40 border border-stone-800/80 p-5 text-stone-400 text-xs">
          <div className="flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-semibold text-stone-200">How the Italian Accent is Created</h4>
              <p className="leading-relaxed">
                Gemini 3.8 TTS synthesizes authentic Italian prosody through melodic vowel prolongation, gently rolled rhotic consonants, animated pitch variation, and Mediterranean rhythmic cadence. Use expressions like <code className="text-amber-300 font-mono">Allora...</code>, <code className="text-amber-300 font-mono">Guarda!</code>, or vocal breathing tags <code className="text-amber-300 font-mono">&lt;breath&gt;</code> to achieve maximum realism.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Italianizer Modal */}
      <ItalianizerModal
        isOpen={isItalianizerOpen}
        onClose={() => setIsItalianizerOpen(false)}
        currentText={text}
        languageMode={languageMode}
        onApplyText={(enhanced) => setText(enhanced)}
      />

      {/* Footer */}
      <footer className="border-t border-stone-900 py-6 text-center text-xs text-stone-500">
        <p>Voce d'Italia • Italian Voice Studio • Powered by Gemini 3.8 TTS & AI Studio</p>
      </footer>
    </div>
  );
}
