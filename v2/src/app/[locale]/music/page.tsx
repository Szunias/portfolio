'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Track {
  id: string;
  title: string;
  artist: string;
  cover: string;
  src: string;
  duration: string;
  year: number;
  tags: string[];
}

const tracks: Track[] = [
  {
    id: '1',
    title: 'Neon Dreams',
    artist: 'Igor Szuniewicz',
    cover: '/assets/audio/covers/neon-dreams.jpg',
    src: '/assets/audio/tracks/neon-dreams.mp3',
    duration: '4:32',
    year: 2024,
    tags: ['Electronic', 'Synthwave'],
  },
  {
    id: '2',
    title: 'Midnight Jazz',
    artist: 'Igor Szuniewicz',
    cover: '/assets/audio/covers/midnight-jazz.jpg',
    src: '/assets/audio/tracks/midnight-jazz.mp3',
    duration: '5:18',
    year: 2024,
    tags: ['Jazz', 'Lofi'],
  },
  {
    id: '3',
    title: 'Industrial Revolution',
    artist: 'Igor Szuniewicz',
    cover: '/assets/audio/covers/industrial.jpg',
    src: '/assets/audio/tracks/industrial.mp3',
    duration: '3:45',
    year: 2023,
    tags: ['Metal', 'Industrial'],
  },
  {
    id: '4',
    title: 'Ethereal Passage',
    artist: 'Igor Szuniewicz',
    cover: '/assets/audio/covers/ethereal.jpg',
    src: '/assets/audio/tracks/ethereal.mp3',
    duration: '6:22',
    year: 2023,
    tags: ['Ambient', 'Cinematic'],
  },
  {
    id: '5',
    title: 'Funk Machine',
    artist: 'Igor Szuniewicz',
    cover: '/assets/audio/covers/funk.jpg',
    src: '/assets/audio/tracks/funk.mp3',
    duration: '4:05',
    year: 2023,
    tags: ['Funk', 'Jazz'],
  },
  {
    id: '6',
    title: 'Dark Horizons',
    artist: 'Igor Szuniewicz',
    cover: '/assets/audio/covers/dark.jpg',
    src: '/assets/audio/tracks/dark.mp3',
    duration: '5:50',
    year: 2023,
    tags: ['Film Score', 'Orchestral'],
  },
];

const filterOptions = ['all', 'electronic', 'jazz', 'film', 'ambient', 'metal'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

export default function MusicPage() {
  const t = useTranslations('music');
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredTracks =
    activeFilter === 'all'
      ? tracks
      : tracks.filter((track) =>
          track.tags.some((tag) => tag.toLowerCase().includes(activeFilter))
        );

  const handlePlayTrack = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handlePrevTrack = () => {
    if (!currentTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    setCurrentTrack(tracks[prevIndex]);
    setProgress(0);
  };

  const handleNextTrack = useCallback(() => {
    setCurrentTrack((current) => {
      if (!current) return null;
      const currentIndex = tracks.findIndex((t) => t.id === current.id);
      const nextIndex = currentIndex < tracks.length - 1 ? currentIndex + 1 : 0;
      return tracks[nextIndex];
    });
    setProgress(0);
  }, []);

  // Simulate progress for demo
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && currentTrack) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNextTrack();
            return 0;
          }
          return prev + 0.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, handleNextTrack]);

  return (
    <div className="pt-24 pb-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            {t('intro.title')}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {t('intro.subtitle')}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {filterOptions.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
            >
              {t(`filters.${filter}`)}
            </Button>
          ))}
        </motion.div>

        {/* Track grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredTracks.map((track) => (
            <motion.div key={track.id} variants={cardVariants}>
              <Card
                hover
                className={`group cursor-pointer ${
                  currentTrack?.id === track.id ? 'border-accent' : ''
                }`}
                onClick={() => handlePlayTrack(track)}
              >
                {/* Cover */}
                <div className="relative aspect-square overflow-hidden">
                  <div className="absolute inset-0 bg-surface-elevated flex items-center justify-center">
                    <span className="text-6xl">🎵</span>
                  </div>
                  {/* Play overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-16 h-16 rounded-full bg-accent flex items-center justify-center"
                    >
                      {currentTrack?.id === track.id && isPlaying ? (
                        <Pause className="w-7 h-7 text-background" />
                      ) : (
                        <Play className="w-7 h-7 text-background ml-1" />
                      )}
                    </motion.div>
                  </div>
                  {/* Now playing indicator */}
                  {currentTrack?.id === track.id && isPlaying && (
                    <div className="absolute bottom-2 left-2 flex gap-1">
                      {[...Array(3)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{ scaleY: [0.4, 1, 0.4] }}
                          transition={{
                            repeat: Infinity,
                            duration: 0.5,
                            delay: i * 0.1,
                          }}
                          className="w-1 h-4 bg-accent rounded-full"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold mb-1 group-hover:text-accent transition-colors">
                    {track.title}
                  </h3>
                  <p className="text-text-secondary text-sm mb-2">{track.artist}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                      {track.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="muted" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <span className="text-text-muted text-sm">{track.duration}</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Sticky audio player */}
      <AnimatePresence>
        {currentTrack && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-4">
                {/* Track info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-12 h-12 rounded-lg bg-surface-elevated flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">🎵</span>
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{currentTrack.title}</p>
                    <p className="text-text-secondary text-sm truncate">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrevTrack}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                    aria-label={t('player.previous')}
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="w-12 h-12 rounded-full bg-accent flex items-center justify-center"
                    aria-label={isPlaying ? t('player.pause') : t('player.play')}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5 text-background" />
                    ) : (
                      <Play className="w-5 h-5 text-background ml-0.5" />
                    )}
                  </motion.button>
                  <button
                    onClick={handleNextTrack}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                    aria-label={t('player.next')}
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>

                {/* Progress bar */}
                <div className="flex-1 hidden md:block">
                  <div className="h-1 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-accent"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Volume */}
                <div className="hidden sm:flex items-center gap-2">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                    aria-label={t('player.volume')}
                  >
                    {isMuted ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-20 accent-accent"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
