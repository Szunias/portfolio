import { useState, useRef } from 'react';
import Player from '@vimeo/player';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const Showreel = () => {
  const { t } = useTranslation();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeChapter, setActiveChapter] = useState<number>(0);

  const timestamps = [
    { time: 0, label: t('hero.showreel_start', 'Start') },
    { time: 10, label: t('hero.chapter.shadow_frames', 'Shadow Frames') },
    { time: 54, label: t('hero.chapter.amorak', 'Amorak') },
    { time: 91, label: t('hero.chapter.akantilado', 'Akantilado') },
    { time: 112, label: t('hero.chapter.ray', 'Ray') },
    { time: 154, label: t('hero.chapter.not_today', 'Not Today') },
    { time: 184, label: t('hero.chapter.ellen_wwise', 'Ellen Wwise') },
    { time: 198, label: t('hero.chapter.pause_and_deserve', 'Pause & Deserve') },
  ];

  const handleLoad = () => {
    if (iframeRef.current && !player) {
      const vimeoPlayer = new Player(iframeRef.current);
      setPlayer(vimeoPlayer);

      vimeoPlayer.on('play', () => setIsPlaying(true));
      vimeoPlayer.on('pause', () => setIsPlaying(false));
      vimeoPlayer.on('timeupdate', (data) => {
        const current = timestamps.slice().reverse().find(ts => data.seconds >= ts.time);
        if (current) {
          setActiveChapter(prev => prev !== current.time ? current.time : prev);
        }
      });
    }
  };

  const jumpTo = (seconds: number) => {
    setActiveChapter(seconds);
    if (player) {
      player.setCurrentTime(seconds);
      player.play();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-12 mb-20">
      {/* Video */}
      <div className="relative aspect-video rounded-2xl overflow-hidden bg-black group hover:shadow-[0_0_40px_rgba(56,189,248,0.2)] transition-all duration-500">
        <iframe
          ref={iframeRef}
          src="https://player.vimeo.com/video/1143625213?badge=0&autopause=0&player_id=0&app_id=58479&controls=1"
          width="100%"
          height="100%"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Showreel"
          onLoad={handleLoad}
          className="absolute inset-0 w-full h-full border-0"
        ></iframe>

        {!isPlaying && (
          <button
            className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/40 hover:bg-black/30 transition-colors cursor-pointer"
            onClick={() => player?.play()}
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="w-20 h-20 flex items-center justify-center bg-white/10 backdrop-blur-sm rounded-full border border-white/20"
            >
              <Play size={32} className="text-white ml-1" fill="white" />
            </motion.div>
          </button>
        )}
      </div>

      {/* Chapter Navigation - Minimal */}
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        {timestamps.map((ts) => {
          const isActive = activeChapter === ts.time;

          return (
            <button
              key={ts.label}
              onClick={() => jumpTo(ts.time)}
              className={`
                relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-accent text-black shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                }
              `}
            >
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs opacity-60">{formatTime(ts.time)}</span>
                <span>{ts.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Showreel;
