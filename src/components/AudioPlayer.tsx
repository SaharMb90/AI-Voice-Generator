import { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Download, Copy, Check, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { GeneratedVoice } from '../types';

interface AudioPlayerProps {
  voice: GeneratedVoice;
  autoPlay?: boolean;
}

export function AudioPlayer({ voice, autoPlay = true }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [waveSeed] = useState(() => Array.from({ length: 36 }, (_, i) => 20 + Math.sin(i * 0.5) * 15 + Math.random() * 25));

  // Initialize or reinitialize audio when voice changes
  useEffect(() => {
    if (!voice.audioBase64) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }

    const audioUrl = `data:${voice.mimeType || 'audio/wav'};base64,${voice.audioBase64}`;
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.onloadedmetadata = () => {
      setDuration(audio.duration || 0);
    };

    audio.ontimeupdate = () => {
      setCurrentTime(audio.currentTime);
    };

    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.playbackRate = playbackRate;
    audio.muted = isMuted;

    if (autoPlay) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.warn('AutoPlay prevented by browser:', e);
        setIsPlaying(false);
      });
    }

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [voice.id, voice.audioBase64]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const toggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    if (audioRef.current) {
      audioRef.current.muted = next;
    }
  };

  const handleDownload = () => {
    try {
      const link = document.createElement('a');
      link.href = `data:${voice.mimeType || 'audio/wav'};base64,${voice.audioBase64}`;
      const safeName = voice.personaName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      link.download = `italian-voice-${safeName}-${Date.now()}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(voice.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Clipboard copy error:', err);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900 to-stone-950 border border-amber-500/25 p-5 sm:p-6 shadow-2xl shadow-amber-950/20">
      {/* Decorative Italian ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-100 text-base sm:text-lg">
                {voice.personaName}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/20 capitalize font-medium">
                {voice.intensity} Accent
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20 font-medium">
                {voice.languageMode === 'italian-native' ? '🇮🇹 Native Italian' : '🇮🇹 Italian Accented'}
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Voice: <span className="text-stone-300 font-mono">{voice.voiceName}</span> • Gemini 3.8 TTS Studio
            </p>
          </div>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyText}
            title="Copy speech transcript"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy Text'}</span>
          </button>
          <button
            onClick={handleDownload}
            title="Download lossless WAV audio"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-stone-900 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download WAV</span>
          </button>
        </div>
      </div>

      {/* Transcript snippet quote */}
      <div className="mb-5 p-3.5 rounded-xl bg-stone-950/70 border border-stone-800/80 text-stone-200 text-sm leading-relaxed italic relative">
        <span className="text-amber-500/60 font-serif text-lg mr-1.5 font-bold">“</span>
        {voice.text}
        <span className="text-amber-500/60 font-serif text-lg ml-1 font-bold">”</span>
      </div>

      {/* Interactive Waveform Visualizer */}
      <div className="mb-4 bg-stone-950/90 rounded-xl p-3 border border-stone-800/90">
        <div className="h-16 flex items-center justify-between gap-1 px-1">
          {waveSeed.map((baseHeight, idx) => {
            const barProgress = (idx / waveSeed.length) * 100;
            const isPassed = barProgress <= progressPercent;
            // animate height when playing
            const dynamicScale = isPlaying
              ? Math.sin(currentTime * 8 + idx * 0.4) * 0.4 + 0.8
              : 0.6;
            const finalHeight = Math.max(12, Math.min(58, baseHeight * dynamicScale));

            return (
              <div
                key={idx}
                className="flex-1 flex items-center justify-center cursor-pointer group py-1"
                onClick={() => {
                  if (audioRef.current && duration > 0) {
                    const targetSec = (idx / waveSeed.length) * duration;
                    audioRef.current.currentTime = targetSec;
                    setCurrentTime(targetSec);
                  }
                }}
              >
                <div
                  style={{ height: `${finalHeight}px` }}
                  className={`w-full max-w-[6px] rounded-full transition-all duration-150 ${
                    isPassed
                      ? 'bg-gradient-to-t from-amber-500 to-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-stone-800 group-hover:bg-stone-600'
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Scrubber slider */}
        <div className="mt-2 flex items-center gap-3">
          <span className="text-xs font-mono text-stone-400 min-w-[34px]">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <span className="text-xs font-mono text-stone-400 min-w-[34px] text-right">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* Playback Controls Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
        <div className="flex items-center gap-2">
          {/* Restart */}
          <button
            onClick={handleRestart}
            title="Restart playback"
            className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Main Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-stone-950 font-bold shadow-lg shadow-amber-500/25 transition active:scale-95"
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
          </button>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="p-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center gap-1 bg-stone-900/90 rounded-xl p-1 border border-stone-800">
          <span className="text-[11px] font-semibold text-stone-400 px-2 uppercase tracking-wider">Speed</span>
          {[0.8, 1, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleRateChange(rate)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition ${
                playbackRate === rate
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
