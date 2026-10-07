import { useState } from 'react';
import { Sparkles, ArrowRight, Check, X, Loader2, Wand2 } from 'lucide-react';

interface ItalianizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentText: string;
  languageMode: 'english-italian-accent' | 'italian-native';
  onApplyText: (italianizedText: string) => void;
}

export function ItalianizerModal({
  isOpen,
  onClose,
  currentText,
  languageMode,
  onApplyText,
}: ItalianizerModalProps) {
  const [inputText, setInputText] = useState(currentText || '');
  const [result, setResult] = useState<{
    transformedText: string;
    explanation?: string;
    italianExpressions?: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTransform = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/voice/italianize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode: languageMode === 'italian-native' ? 'native-italian' : 'accented-english',
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to transform script');
      }

      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result?.transformedText) {
      onApplyText(result.transformedText);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl rounded-2xl bg-stone-900 border border-amber-500/30 p-6 shadow-2xl shadow-amber-950/40 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Wand2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-100 flex items-center gap-2">
              Italian Script Coach
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                {languageMode === 'italian-native' ? 'Native Italian Translation' : 'Italian Accent Phrasing'}
              </span>
            </h2>
            <p className="text-xs text-stone-400">
              Infuse your lines with authentic Italian cadence, emotional rhythm, and colloquial charm.
            </p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-3 mb-5">
          <label className="text-xs font-semibold text-stone-300 uppercase tracking-wider">
            Original Text or Idea:
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="e.g., Welcome everyone to our dinner. I made this homemade pasta with fresh tomatoes and olive oil. Enjoy your food."
            rows={3}
            className="w-full rounded-xl bg-stone-950 border border-stone-800 p-3.5 text-sm text-stone-100 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition resize-none placeholder:text-stone-600"
          />

          <button
            onClick={handleTransform}
            disabled={loading || !inputText.trim()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Crafting Italian Cadence...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Enrich with Italian Accent & Cadence</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-800 text-red-200 text-xs">
            {error}
          </div>
        )}

        {/* Transformed Result */}
        {result && (
          <div className="space-y-4 pt-3 border-t border-stone-800 animate-in fade-in slide-in-from-bottom-2">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  Enhanced Italian Accent Script:
                </span>
              </div>
              <div className="p-4 rounded-xl bg-stone-950/90 border border-amber-500/40 text-stone-100 text-sm leading-relaxed font-serif italic shadow-inner">
                "{result.transformedText}"
              </div>
            </div>

            {/* Expressions detected */}
            {result.italianExpressions && result.italianExpressions.length > 0 && (
              <div>
                <span className="text-xs text-stone-400 block mb-1">Authentic touches added:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.italianExpressions.map((expr, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-stone-800 border border-stone-700 text-amber-300 font-medium"
                    >
                      {expr}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.explanation && (
              <p className="text-xs text-stone-400 bg-stone-950/50 p-3 rounded-lg border border-stone-800/80">
                <strong className="text-stone-300 font-medium">Coach's note:</strong> {result.explanation}
              </p>
            )}

            {/* Apply button */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-stone-400 hover:text-white bg-stone-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/25 transition active:scale-95"
              >
                <span>Use this Script in Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
