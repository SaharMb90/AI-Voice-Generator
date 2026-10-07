import { VoicePersona } from '../types';
import { PERSONAS } from '../data/personasAndPresets';
import { MapPin, Check } from 'lucide-react';

interface PersonaSelectorProps {
  selectedPersonaId: string;
  onSelectPersona: (persona: VoicePersona) => void;
  onUseSampleText: (text: string) => void;
}

export function PersonaSelector({
  selectedPersonaId,
  onSelectPersona,
  onUseSampleText,
}: PersonaSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-stone-200 tracking-wide flex items-center gap-2">
          <span>Choose Italian Voice Persona</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-normal">
            6 Italian Regional Characters
          </span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {PERSONAS.map((persona) => {
          const isSelected = selectedPersonaId === persona.id;
          return (
            <div
              key={persona.id}
              onClick={() => onSelectPersona(persona)}
              className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 flex flex-col justify-between border ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-950/40 via-stone-900 to-stone-900 border-amber-500 ring-2 ring-amber-500/30 shadow-lg shadow-amber-950/40'
                  : 'bg-stone-900/60 hover:bg-stone-900 border-stone-800 hover:border-stone-700'
              }`}
            >
              {/* Selected indicator badge */}
              {isSelected && (
                <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="text-2xl p-2 rounded-xl bg-stone-800/80 border border-stone-700/60 shadow-inner flex items-center justify-center">
                    {persona.avatar}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-100 text-base leading-tight flex items-center gap-1.5">
                      {persona.name}
                    </h3>
                    <p className="text-xs text-amber-400 font-medium">{persona.title}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-2 font-mono">
                  <MapPin className="w-3 h-3 text-stone-500" />
                  <span>{persona.origin}</span>
                  <span className="text-stone-600">•</span>
                  <span className="capitalize">{persona.gender}</span>
                  <span className="text-stone-600">•</span>
                  <span className="text-stone-300 font-semibold">{persona.voiceName}</span>
                </div>

                <p className="text-xs text-stone-300/90 leading-relaxed mb-3">
                  {persona.description}
                </p>
              </div>

              <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2">
                <span className="text-[11px] text-stone-400 italic truncate">
                  "{persona.tagline}"
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPersona(persona);
                    onUseSampleText(persona.samplePreviewText);
                  }}
                  className="shrink-0 text-[11px] font-semibold text-amber-300 hover:text-amber-200 hover:underline px-1.5 py-0.5 rounded transition"
                >
                  Use sample
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
