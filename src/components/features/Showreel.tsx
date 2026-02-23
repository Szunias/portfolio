import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Play, AlertCircle, Loader2 } from 'lucide-react';
import Player from '@vimeo/player';

import { formatTime } from '@/utils';

const TIMESTAMPS = [
  { time: 0, labelKey: 'hero.showreel_start', fallback: 'Start' },
  { time: 10, labelKey: 'hero.chapter.shadow_frames', fallback: 'Shadow Frames' },
  { time: 54, labelKey: 'hero.chapter.amorak', fallback: 'Amorak' },
  { time: 91, labelKey: 'hero.chapter.akantilado', fallback: 'Akantilado' },
  { time: 112, labelKey: 'hero.chapter.ray', fallback: 'Ray' },
  { time: 154, labelKey: 'hero.chapter.not_today', fallback: 'Not Today' },
  { time: 184, labelKey: 'hero.chapter.ellen_wwise', fallback: 'Ellen Wwise' },
  { time: 198, labelKey: 'hero.chapter.pause_and_deserve', fallback: 'Pause & Deserve' },
] as const;

/** Embeds the Vimeo showreel with chapter navigation timestamps. */
const Showreel = () => {
  const { t } = useTranslation('home');
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<Player | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<number>(0);
  const [error, setError] = useState(false);

  // Clean up Vimeo player on unmount
  useEffect(() => {
    return () => {
      const p = playerRef.current;
      if (p) {
        p.off('play');
        p.off('pause');
        p.off('timeupdate');
        p.destroy().catch(() => {});
        playerRef.current = null;
      }
    };
  }, []);

  const handleLoad = useCallback(() => {
    if (iframeRef.current && !playerRef.current) {
      setIframeLoading(false);
      const vimeoPlayer = new Player(iframeRef.current);
      playerRef.current = vimeoPlayer;

      vimeoPlayer.ready().then(() => {
        vimeoPlayer.on('play', () => setIsPlaying(true));
        vimeoPlayer.on('pause', () => setIsPlaying(false));
        vimeoPlayer.on('timeupdate', (data) => {
          // Walk timestamps in reverse to find the latest one that's been passed
          const current = TIMESTAMPS.slice().reverse().find(ts => data.seconds >= ts.time);
          if (current) {
            setActiveChapter(prev => prev !== current.time ? current.time : prev);
          }
        });
        setPlayerReady(true);
      }).catch((err) => {
        console.error('Vimeo player error:', err);
        // Clean up the failed player instance
        vimeoPlayer.destroy().catch(() => {});
        playerRef.current = null;
        setError(true);
      });
    }
  }, []);

  const jumpTo = (seconds: number) => {
    const p = playerRef.current;
    if (p && playerReady) {
      p.setCurrentTime(seconds).then(() => {
        p.play();
      }).catch((err) => {
        console.error('Failed to seek video:', err);
      });
    }
  };

  return (
    <div id="showreel" className="w-full max-w-content mx-auto py-16">
      {/* Video Container with Premium Styling */}
      <div className="relative aspect-video rounded-lg overflow-hidden bg-surface-raised border border-border shadow-glow-accent">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-raised">
            <AlertCircle size={48} className="text-error mb-4" />
            <p className="text-text-secondary text-center px-4 mb-4 text-body-sm">
              {t('errors.video_load_failed', 'Failed to load video. Please refresh the page.')}
            </p>
            <button
              onClick={() => { setError(false); setPlayerReady(false); setIframeLoading(true); playerRef.current = null; }}
              className="px-6 py-3 bg-accent text-surface font-semibold rounded-md hover:bg-accent-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
            >
              {t('hero.retry', 'Try Again')}
            </button>
          </div>
        ) : (
          <>
            <iframe
              ref={iframeRef}
              src="https://player.vimeo.com/video/1143625213?badge=0&autopause=0&player_id=0&app_id=58479&controls=1"
              width="100%"
              height="100%"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={t('hero.showreel_title', 'Igor Szuniewicz Audio Design Showreel')}
              onLoad={handleLoad}
              className="absolute inset-0 w-full h-full border-0"
            ></iframe>

            {iframeLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface-raised">
                <Loader2 size={32} className="text-accent animate-spin" />
              </div>
            )}

            {!isPlaying && playerReady && (
              <button
                className="absolute inset-0 w-full h-full flex items-center justify-center bg-surface/60 hover:bg-surface/40 transition-colors cursor-pointer"
                onClick={() => playerRef.current?.play().catch((err) => console.error('Play failed:', err))}
                aria-label="Play showreel video"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 flex items-center justify-center bg-surface-raised/80 border-2 border-accent rounded-full shadow-glow-accent"
                >
                  <Play size={32} className="text-accent ml-1" fill="currentColor" />
                </motion.div>
              </button>
            )}
          </>
        )}
      </div>

      {/* Chapter Navigation - Tracklist Style */}
      <div className="mt-8 space-y-2">
        <h3 className="font-mono text-label uppercase text-text-tertiary tracking-wider mb-4">
          {t('hero.chapters', 'Chapters')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
          {TIMESTAMPS.map((ts) => {
            const isActive = activeChapter === ts.time;
            const label = t(ts.labelKey, ts.fallback);

            return (
              <button
                key={ts.time}
                onClick={() => jumpTo(ts.time)}
                disabled={!playerReady}
                className={`
                  relative px-3 py-2 rounded text-left text-body-sm font-medium transition-all duration-200
                  ${!playerReady
                    ? 'border border-border text-text-tertiary opacity-50 cursor-not-allowed'
                    : isActive
                      ? 'bg-accent/10 text-accent border border-accent/15'
                      : 'border border-border text-text-secondary hover:border-border-hover hover:text-text-primary hover:bg-surface-overlay'
                  }
                  focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface
                `}
              >
                <span className="flex flex-col gap-1">
                  <span className="font-mono text-caption text-text-tertiary">{formatTime(ts.time)}</span>
                  <span className="truncate">{label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Showreel;
