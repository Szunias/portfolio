import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { useAudio, useAudioProgress } from '@/context/AudioContext';
import { formatTime } from '@/utils';

const VISUALIZER_BARS = 6;
const barDelays = Array.from({ length: VISUALIZER_BARS }, (_, i) => `${i * 0.12}s`);

/** Fixed bottom audio player bar with playback controls, progress scrubber, and volume slider. */
const AudioPlayer = () => {
  const { t } = useTranslation('common');
  const {
    currentTrack, isPlaying, togglePlay, nextTrack, prevTrack,
    seek, volume, setVolume, isPlayerVisible, closePlayer
  } = useAudio();
  const { progress, duration, currentTime } = useAudioProgress();

  const [prevVolume, setPrevVolume] = useState(volume);
  const shouldReduceMotion = useReducedMotion();
  // Derive muted state from volume to keep in sync with AudioContext
  const isMuted = volume === 0;

  if (!currentTrack || !isPlayerVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface-overlay/90 backdrop-blur-xl border-t border-border z-audio-player flex items-center px-3 sm:px-6 md:px-8" style={{ height: '72px', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      {/* Progress Bar (Top Line) */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 hover:h-2 bg-border group transition-all duration-200 ease-out z-50 ${duration > 0 ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={(e) => {
            if (duration <= 0) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const percent = (e.clientX - rect.left) / rect.width;
            seek(percent * duration);
        }}
      >
        {/* Invisible expanded hit area for easier scrubbing */}
        <div className="absolute -top-2 -bottom-2 left-0 right-0" />
        <div
            className="h-full bg-accent transition-all duration-200 rounded-r-full relative"
            style={{ width: `${progress}%` }}
        >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 group-hover:w-4 group-hover:h-4 bg-accent-hover rounded-full shadow-glow-accent transition-all duration-200 -translate-x-[1px]"></div>
        </div>
      </div>

      <div className="flex items-center justify-between w-full max-w-7xl mx-auto gap-2 sm:gap-4">

        {/* Left: Info & Visualizer */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-surface-raised overflow-hidden border border-border flex-shrink-0 shadow-glow-accent">
                <img
                    src={`/${currentTrack.cover}`}
                    alt={currentTrack.title}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="min-w-0">
                <h4 className="text-text-primary font-medium text-sm truncate">{currentTrack.title}</h4>
                <div className="flex items-center gap-1.5 sm:gap-2">
                    {/* Mini Visualizer */}
                    <div className="flex items-end gap-[1px] h-2.5 sm:h-3">
                        {barDelays.map((delay, i) => (
                            <div
                                key={`bar-${i}`}
                                className={`w-[2px] sm:w-1 bg-accent rounded-t-sm ${isPlaying && !shouldReduceMotion ? 'animate-[music-bar_0.8s_ease-in-out_infinite]' : ''}`}
                                style={{
                                    height: isPlaying && !shouldReduceMotion ? undefined : '10%',
                                    animationDelay: isPlaying && !shouldReduceMotion ? delay : undefined,
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] sm:text-xs font-mono text-text-tertiary">
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                </div>
            </div>
        </div>

        {/* Center: Controls */}
        <div className="flex items-center gap-2 sm:gap-4 md:gap-6">
            <Button onClick={prevTrack} variant="ghost" size="icon" className="text-text-secondary hover:text-accent p-2 sm:p-3 transition-colors duration-200" aria-label={t('buttons.previous', 'Previous Track')}>
                <SkipBack size={16} className="sm:w-5 sm:h-5" />
            </Button>

            <Button
                onClick={togglePlay}
                variant="primary"
                size="icon"
                className="w-12 h-12 sm:w-14 sm:h-14 rounded-full p-0 bg-accent hover:bg-accent-hover text-surface flex-shrink-0 shadow-glow-accent transition-all duration-200"
                aria-label={isPlaying ? t('buttons.pause', 'Pause') : t('buttons.play', 'Play')}
            >
                {isPlaying ? <Pause size={20} className="sm:w-6 sm:h-6" fill="currentColor" /> : <Play size={20} className="sm:w-6 sm:h-6 ml-0.5" fill="currentColor" />}
            </Button>

            <Button onClick={nextTrack} variant="ghost" size="icon" className="text-text-secondary hover:text-accent p-2 sm:p-3 transition-colors duration-200" aria-label={t('buttons.next', 'Next Track')}>
                <SkipForward size={16} className="sm:w-5 sm:h-5" />
            </Button>
        </div>

        {/* Right: Volume & Close */}
        <div className="flex items-center justify-end gap-2 sm:gap-4 flex-1">
            <div className="hidden sm:flex items-center gap-2 group">
                <Button
                    onClick={() => {
                        if (isMuted) {
                            setVolume(prevVolume || 0.7);
                        } else {
                            setPrevVolume(volume);
                            setVolume(0);
                        }
                    }}
                    variant="ghost"
                    size="icon"
                    className="text-text-secondary hover:text-accent transition-colors duration-200"
                    aria-label={isMuted ? t('buttons.unmute', 'Unmute') : t('buttons.mute', 'Mute')}
                >
                    {volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                </Button>
                <div className="w-24 h-2 hover:h-3 bg-border rounded-full overflow-hidden relative cursor-pointer transition-all duration-200"
                     onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const vol = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                        setVolume(vol);
                        if (vol > 0) setPrevVolume(vol);
                     }}
                >
                    <div
                        className="h-full bg-accent transition-all duration-200"
                        style={{ width: `${volume * 100}%` }}
                    ></div>
                </div>
            </div>

            {/* Close Button */}
            <Button
                onClick={closePlayer}
                variant="ghost"
                size="icon"
                className="text-text-secondary hover:text-error p-1 sm:p-2 sm:ml-4 flex-shrink-0 transition-colors duration-200"
                title={t('audio_player.close', 'Close Player')}
                aria-label={t('audio_player.close', 'Close Player')}
            >
                <X size={16} className="sm:w-5 sm:h-5" />
            </Button>
        </div>

      </div>
    </div>
  );
};

export default AudioPlayer;
