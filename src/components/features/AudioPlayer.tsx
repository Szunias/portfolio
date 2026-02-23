import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import {
  Play, Pause, SkipBack, SkipForward,
  Volume2, Volume1, Volume, VolumeX, X,
} from 'lucide-react';

import { useAudio, useAudioProgress } from '@/context/AudioContext';
import { formatTime } from '@/utils';

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const VISUALIZER_BARS = 5;
const barDelays = Array.from({ length: VISUALIZER_BARS }, (_, i) => `${i * 0.13}s`);

/** Pick a speaker icon based on volume level (0-1). */
const VolumeIcon = ({ vol, size = 18 }: { vol: number; size?: number }) => {
  if (vol === 0) return <VolumeX size={size} />;
  if (vol < 0.33) return <Volume size={size} />;
  if (vol < 0.66) return <Volume1 size={size} />;
  return <Volume2 size={size} />;
};

/* ------------------------------------------------------------------ */
/*  AudioPlayer                                                       */
/* ------------------------------------------------------------------ */

const AudioPlayer = () => {
  const { t } = useTranslation('common');
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    seek, volume, setVolume, isPlayerVisible, closePlayer,
  } = useAudio();
  const { progress, duration, currentTime } = useAudioProgress();

  const shouldReduceMotion = useReducedMotion();

  // --- Volume mute memory ---
  const [prevVolume, setPrevVolume] = useState(volume);
  const isMuted = volume === 0;

  // --- Progress scrub state ---
  const progressRef = useRef<HTMLDivElement>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercent, setScrubPercent] = useState<number | null>(null);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  // --- Volume drag state ---
  const volumeRef = useRef<HTMLDivElement>(null);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);

  /* ---------------------------------------------------------------- */
  /*  Progress bar helpers                                            */
  /* ---------------------------------------------------------------- */

  const calcProgressPercent = useCallback((clientX: number): number => {
    if (!progressRef.current) return 0;
    const rect = progressRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  const seekToPercent = useCallback(
    (pct: number) => {
      if (duration > 0) seek(pct * duration);
    },
    [duration, seek],
  );

  // Mouse / touch scrub on progress bar
  useEffect(() => {
    if (!isScrubbing) return;

    const onMove = (e: MouseEvent) => {
      const pct = calcProgressPercent(e.clientX);
      setScrubPercent(pct);
      seekToPercent(pct);
    };
    const onUp = () => {
      setIsScrubbing(false);
      setScrubPercent(null);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const pct = calcProgressPercent(e.touches[0].clientX);
        setScrubPercent(pct);
        seekToPercent(pct);
      }
    };
    const onTouchEnd = () => {
      setIsScrubbing(false);
      setScrubPercent(null);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isScrubbing, calcProgressPercent, seekToPercent]);

  const handleProgressDown = useCallback(
    (clientX: number) => {
      if (duration <= 0) return;
      const pct = calcProgressPercent(clientX);
      setIsScrubbing(true);
      setScrubPercent(pct);
      seekToPercent(pct);
    },
    [duration, calcProgressPercent, seekToPercent],
  );

  /* ---------------------------------------------------------------- */
  /*  Volume slider helpers                                           */
  /* ---------------------------------------------------------------- */

  const calcVolumePercent = useCallback((clientX: number): number => {
    if (!volumeRef.current) return 0;
    const rect = volumeRef.current.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  }, []);

  useEffect(() => {
    if (!isDraggingVolume) return;

    const onMove = (e: MouseEvent) => {
      const vol = calcVolumePercent(e.clientX);
      setVolume(vol);
      if (vol > 0) setPrevVolume(vol);
    };
    const onUp = () => setIsDraggingVolume(false);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        const vol = calcVolumePercent(e.touches[0].clientX);
        setVolume(vol);
        if (vol > 0) setPrevVolume(vol);
      }
    };
    const onTouchEnd = () => setIsDraggingVolume(false);

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [isDraggingVolume, calcVolumePercent, setVolume]);

  const handleVolumeDown = useCallback(
    (clientX: number) => {
      const vol = calcVolumePercent(clientX);
      setIsDraggingVolume(true);
      setVolume(vol);
      if (vol > 0) setPrevVolume(vol);
    },
    [calcVolumePercent, setVolume],
  );

  /* ---------------------------------------------------------------- */
  /*  Keyboard controls                                               */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (!currentTrack || !isPlayerVisible) return;

    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName ?? '').toUpperCase();
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'ArrowLeft': {
          e.preventDefault();
          const rewind = e.shiftKey ? 10 : 5;
          seek(Math.max(0, currentTime - rewind));
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          const fwd = e.shiftKey ? 10 : 5;
          seek(Math.min(duration, currentTime + fwd));
          break;
        }
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(1, volume + 0.1));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 0.1));
          break;
        case 'm':
        case 'M':
          if (isMuted) {
            setVolume(prevVolume || 0.7);
          } else {
            setPrevVolume(volume);
            setVolume(0);
          }
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [
    currentTrack, isPlayerVisible, togglePlay, seek, setVolume,
    currentTime, duration, volume, isMuted, prevVolume,
  ]);

  /* ---------------------------------------------------------------- */
  /*  Prevent text selection while scrubbing                          */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    if (isScrubbing || isDraggingVolume) {
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    } else {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    }
    return () => {
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
    };
  }, [isScrubbing, isDraggingVolume]);

  /* ---------------------------------------------------------------- */
  /*  Render guard                                                    */
  /* ---------------------------------------------------------------- */

  if (!currentTrack || !isPlayerVisible) return null;

  // Progress display value: while scrubbing use the scrub position, else real progress
  const displayPercent = scrubPercent !== null ? scrubPercent * 100 : progress;
  const displayTime = scrubPercent !== null ? scrubPercent * duration : currentTime;

  /* ---------------------------------------------------------------- */
  /*  JSX                                                             */
  /* ---------------------------------------------------------------- */

  return (
    <div
      role="region"
      aria-label={t('audio_player.label', 'Audio player')}
      className="fixed bottom-0 left-0 right-0 bg-surface-overlay/90 backdrop-blur-xl border-t border-border z-audio-player select-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* ============================================================ */}
      {/*  PROGRESS BAR (top edge, full-width)                         */}
      {/* ============================================================ */}
      <div
        ref={progressRef}
        role="slider"
        aria-label={t('audio_player.seek', 'Seek')}
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(displayTime)}
        aria-valuetext={`${formatTime(displayTime)} ${t('audio_player.of', 'of')} ${formatTime(duration)}`}
        tabIndex={0}
        className="absolute top-0 left-0 right-0 group/progress"
        style={{ cursor: duration > 0 ? 'pointer' : 'default' }}
        /* Mouse */
        onMouseDown={(e) => handleProgressDown(e.clientX)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => { setShowTooltip(false); setHoverPercent(null); }}
        onMouseMove={(e) => {
          if (progressRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            setHoverPercent(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
          }
        }}
        /* Touch */
        onTouchStart={(e) => {
          if (e.touches[0]) {
            e.preventDefault();
            handleProgressDown(e.touches[0].clientX);
          }
        }}
        /* Keyboard on focused slider */
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') {
            e.preventDefault();
            e.stopPropagation();
            seek(Math.max(0, currentTime - (e.shiftKey ? 10 : 5)));
          } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            e.stopPropagation();
            seek(Math.min(duration, currentTime + (e.shiftKey ? 10 : 5)));
          }
        }}
      >
        {/* Invisible touch target: 22px above + bar + 22px below = ~48px */}
        <div className="absolute -top-[22px] left-0 right-0 h-[22px]" />
        <div className="absolute -bottom-[0px] left-0 right-0 h-[22px]" />

        {/* Visual bar container */}
        <div className="relative h-[3px] group-hover/progress:h-[5px] transition-all duration-150 w-full">
          {/* Background track */}
          <div className="absolute inset-0 bg-white/10 rounded-full" />

          {/* Progress fill */}
          <div
            className="absolute inset-y-0 left-0 bg-accent rounded-full"
            style={{
              width: `${displayPercent}%`,
              transition: isScrubbing ? 'none' : 'width 150ms linear',
            }}
          />

          {/* Handle (always visible) */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 group-hover/progress:w-4 group-hover/progress:h-4 bg-accent rounded-full shadow-md transition-all duration-150 pointer-events-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            style={{
              left: `${displayPercent}%`,
              transform: `translate(-50%, -50%)`,
              transition: isScrubbing ? 'width 150ms, height 150ms' : undefined,
            }}
          />

          {/* Time tooltip on hover */}
          {showTooltip && hoverPercent !== null && duration > 0 && !isScrubbing && (
            <div
              className="absolute -top-8 px-1.5 py-0.5 bg-surface-raised border border-border rounded text-[10px] font-mono text-text-primary pointer-events-none whitespace-nowrap"
              style={{
                left: `${hoverPercent * 100}%`,
                transform: 'translateX(-50%)',
              }}
            >
              {formatTime(hoverPercent * duration)}
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/*  MAIN CONTROLS AREA                                          */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2 sm:gap-3 px-3 sm:px-6 md:px-8 h-[68px]">

        {/* ── Left: Album art + track info + visualizer ────────── */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Album art */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-md bg-surface-raised overflow-hidden border border-border flex-shrink-0 shadow-glow-accent">
            <img
              src={`/${currentTrack.cover}`}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Track info */}
          <div className="min-w-0">
            <p className="text-text-primary font-medium text-sm truncate max-w-[120px] sm:max-w-[200px] md:max-w-none">
              {currentTrack.title}
            </p>
            <div className="flex items-center gap-1.5">
              {/* Mini visualizer */}
              <div className="flex items-end gap-[2px] h-2.5 sm:h-3">
                {barDelays.map((delay, i) => (
                  <div
                    key={`bar-${i}`}
                    className={`w-[2px] bg-accent rounded-t-sm ${
                      isPlaying && !shouldReduceMotion
                        ? 'animate-[waveform-bar_1.2s_ease-in-out_infinite]'
                        : ''
                    }`}
                    style={{
                      height: isPlaying && !shouldReduceMotion ? undefined : '10%',
                      animationDelay: isPlaying && !shouldReduceMotion ? delay : undefined,
                    }}
                  />
                ))}
              </div>

              {/* Time display */}
              <span className="hidden sm:inline text-[10px] sm:text-caption font-mono text-text-tertiary whitespace-nowrap">
                {formatTime(displayTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        {/* ── Center: Playback controls ────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-3">
          {/* Previous */}
          <button
            onClick={prevTrack}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-accent hover:bg-white/5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label={t('buttons.previous')}
          >
            <SkipBack size={18} />
          </button>

          {/* Play / Pause */}
          <button
            onClick={togglePlay}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-accent hover:bg-accent-hover text-surface flex-shrink-0 shadow-glow-accent transition-all duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label={isPlaying ? t('buttons.pause', 'Pause') : t('buttons.play', 'Play')}
          >
            {isPlaying ? (
              <Pause size={22} fill="currentColor" />
            ) : (
              <Play size={22} fill="currentColor" className="ml-0.5" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-accent hover:bg-white/5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label={t('buttons.next')}
          >
            <SkipForward size={18} />
          </button>
        </div>

        {/* ── Right: Volume + Close ────────────────────────────── */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 flex-1">

          {/* Volume (desktop only) */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Mute toggle */}
            <button
              onClick={() => {
                if (isMuted) {
                  setVolume(prevVolume || 0.7);
                } else {
                  setPrevVolume(volume);
                  setVolume(0);
                }
              }}
              className="flex items-center justify-center w-9 h-9 rounded-full text-text-secondary hover:text-accent hover:bg-white/5 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label={isMuted ? t('buttons.unmute', 'Unmute') : t('buttons.mute', 'Mute')}
            >
              <VolumeIcon vol={volume} />
            </button>

            {/* Volume slider */}
            <div
              ref={volumeRef}
              role="slider"
              aria-label={t('audio_player.volume', 'Volume')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
              aria-valuetext={`${Math.round(volume * 100)}%`}
              tabIndex={0}
              className="relative w-20 group/vol cursor-pointer"
              onMouseDown={(e) => handleVolumeDown(e.clientX)}
              onTouchStart={(e) => {
                if (e.touches[0]) {
                  e.preventDefault();
                  handleVolumeDown(e.touches[0].clientX);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
                  e.preventDefault();
                  e.stopPropagation();
                  setVolume(Math.min(1, volume + 0.05));
                } else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
                  e.preventDefault();
                  e.stopPropagation();
                  setVolume(Math.max(0, volume - 0.05));
                }
              }}
            >
              {/* Touch padding */}
              <div className="absolute -top-[18px] -bottom-[18px] left-0 right-0" />

              {/* Visual bar */}
              <div className="relative h-1 group-hover/vol:h-1.5 transition-all duration-150 rounded-full">
                {/* Background */}
                <div className="absolute inset-0 bg-white/10 rounded-full" />
                {/* Fill */}
                <div
                  className="absolute inset-y-0 left-0 bg-accent rounded-full"
                  style={{
                    width: `${volume * 100}%`,
                    transition: isDraggingVolume ? 'none' : 'width 100ms linear',
                  }}
                />
                {/* Handle */}
                <div
                  className="absolute top-1/2 w-2.5 h-2.5 group-hover/vol:w-3 group-hover/vol:h-3 bg-text-primary rounded-full shadow-sm transition-all duration-150 pointer-events-none"
                  style={{
                    left: `${volume * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Close button */}
          <button
            onClick={closePlayer}
            className="flex items-center justify-center w-10 h-10 rounded-full text-text-secondary hover:text-error hover:bg-white/5 transition-colors duration-150 sm:ml-2 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            aria-label={t('audio_player.close', 'Close Player')}
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
