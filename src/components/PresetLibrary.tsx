import { useState } from 'react';
import { ScriptPreset } from '../types';
import { SCRIPT_PRESETS, PERSONAS } from '../data/personasAndPresets';
import { Play, Sparkles, Coffee, Utensils, Compass, Film, HeartHandshake, Languages } from 'lucide-react';

interface PresetLibraryProps {
  onSelectPreset: (preset: ScriptPreset, autoGenerate?: boolean) => void;
}

export function PresetLibrary({ onSelectPreset }: PresetLibraryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Presets', icon: Sparkles },
    { id: 'cucina', label: 'Cucina & Food', icon: Utensils },
    { id: 'espresso', label: 'Caffè & Morning', icon: Coffee },
    { id: 'dolce-vita', label: 'La Dolce Vita', icon: HeartHandshake },
    { id: 'travel', label: 'Rome & Travel', icon: Compass },
    { id: 'cinematic', label: 'Cinematic Voice', icon: Film },
    { id: 'native', label: 'Native Italian', icon: Languages },
  ];

  const filteredPresets = selectedCategory === 'all'
    ? SCRIPT_PRESETS
    : SCRIPT_PRESETS.filter((p) => p.category === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20'
                  : 'bg-stone-900 hover:bg-stone-800 text-stone-300 border border-stone-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preset Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredPresets.map((preset) => {
          const persona = PERSONAS.find((p) => p.id === preset.personaId) || PERSONAS[0];
          return (
            <div
              key={preset.id}
              className="group relative rounded-2xl bg-stone-900/80 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/40 p-4 transition-all duration-200 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 rounded-lg bg-stone-800/80 border border-stone-700/60">
                      {persona.avatar}
                    </span>
                    <div>
                      <h4 className="font-bold text-stone-100 text-sm group-hover:text-amber-300 transition-colors">
                        {preset.title}
                      </h4>
                      <p className="text-[11px] text-stone-400">{preset.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 border border-stone-700 font-mono">
                    {persona.name}
                  </span>
                </div>

                <p className="text-xs text-stone-300 leading-relaxed italic line-clamp-3 my-2.5 font-serif bg-stone-950/60 p-2.5 rounded-xl border border-stone-800/70">
                  "{preset.text}"
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2 border-t border-stone-800/70">
                <span className="text-[11px] font-medium text-amber-400 capitalize">
                  {preset.intensity} • {preset.languageMode === 'italian-native' ? 'Native Italian' : 'Italian Accent'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onSelectPreset(preset, false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 transition"
                  >
                    Load in Studio
                  </button>
                  <button
                    onClick={() => onSelectPreset(preset, true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-stone-950 bg-amber-500 hover:bg-amber-400 shadow-sm shadow-amber-500/20 transition active:scale-95"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Generate Now</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
