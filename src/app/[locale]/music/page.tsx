'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useAudio } from '@/context/AudioContext';
import MusicHero from '@/components/features/music/MusicHero';
import TrackCard from '@/components/features/music/TrackCard';
import { motion } from 'framer-motion';
import tracksData from '@/data/tracks.json';
import { Track } from '@/types';

export default function MusicPage() {
  const t = useTranslations('music');
  const locale = useLocale();
  const { currentTrack, isPlaying, playTrack, playlist } = useAudio();

  // Get description based on locale
  const getDesc = (track: Track) => {
    const lang = locale.split('-')[0];
    return track?.desc?.[lang as 'en' | 'pl' | 'nl'] || track?.desc?.['en'] || '';
  };

  // Filter tracks by tag (optional - for future filtering)
  const allTracks = playlist.length > 0 ? playlist : (tracksData as Track[]);

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Hero Section - Now Playing */}
      <MusicHero />

      {/* Track List Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                {t('all_tracks') || 'All Tracks'}
              </span>
            </h2>
            <p className="text-slate-400 text-lg">
              {t('tracks_subtitle') || 'Browse and listen to my music compositions and productions'}
            </p>
          </motion.div>

          {/* Tracks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {allTracks.map((track, index) => (
              <TrackCard
                key={track.id}
                track={track}
                index={index}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying && currentTrack?.id === track.id}
                onPlay={playTrack}
              />
            ))}
          </div>

          {/* Empty State */}
          {allTracks.length === 0 && (
            <div className="text-center py-20">
              <p className="text-slate-500 text-lg">
                {t('no_tracks') || 'No tracks available'}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
              {t('about_title') || 'About My Music'}
            </h2>
            <div className="prose prose-invert max-w-none">
              <p className="text-slate-300 text-lg leading-relaxed">
                {t('about_description') || 'My music spans multiple genres from electronic to jazz. I focus on creating immersive soundscapes and memorable melodies that work both as standalone compositions and as part of larger multimedia projects.'}
              </p>
            </div>

            {/* Platform Links */}
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://open.spotify.com/artist/6jEBXZZOeunaMzMnnHYvd6"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-accent/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-300"
              >
                Spotify
              </a>
              <a
                href="https://music.apple.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 hover:border-accent/40 hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-300"
              >
                Apple Music
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
