import { useState } from 'react';
import { GeneratedVoice } from '../types';
import { Play, Download, Trash2, Clock, Check, Copy } from 'lucide-react';

interface HistoryListProps {
  history: GeneratedVoice[];
  onPlayVoice: (voice: GeneratedVoice) => void;
  onClearHistory: () => void;
}

export function HistoryList({ history, onPlayVoice, onClearHistory }: HistoryListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="text-center py-12 rounded-2xl bg-stone-900/40 border border-stone-800/80 p-6">
        <div className="w-12 h-12 rounded-full bg-stone-800/80 text-stone-500 flex items-center justify-center mx-auto mb-3">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-semibold text-stone-300">No Generated Clips Yet</h4>
        <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
          Generated Italian voices will appear here for instant replay and lossless WAV download.
        </p>
      </div>
    );
  }

  const handleDownload = (voice: GeneratedVoice) => {
    const link = document.createElement('a');
    link.href = `data:${voice.mimeType || 'audio/wav'};base64,${voice.audioBase64}`;
    const safeName = voice.personaName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    link.download = `italian-voice-${safeName}-${voice.timestamp}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopy = async (voice: GeneratedVoice) => {
    try {
      await navigator.clipboard.writeText(voice.text);
      setCopiedId(voice.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider">
          {history.length} {history.length === 1 ? 'Clip' : 'Clips'} Generated in Session
        </span>
        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-400 transition"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      <div className="space-y-2.5">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 transition"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-stone-200 text-sm">
                  {item.personaName}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono capitalize">
                  {item.intensity}
                </span>
                <span className="text-[10px] text-stone-500 font-mono">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <p className="text-xs text-stone-300/80 truncate italic">
                "{item.text}"
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <button
                onClick={() => handleCopy(item)}
                title="Copy script"
                className="p-2 rounded-lg text-stone-400 hover:text-stone-200 bg-stone-800 hover:bg-stone-700 transition"
              >
                {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => handleDownload(item)}
                title="Download WAV"
                className="p-2 rounded-lg text-stone-400 hover:text-amber-300 bg-stone-800 hover:bg-stone-700 transition"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onPlayVoice(item)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm transition active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play in Studio</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
