import { useTranslation } from 'react-i18next';

import MusicHero from '../components/features/music/MusicHero';
import TrackCard from '../components/features/music/TrackCard';
import SEO from '../components/layout/SEO';
import { useAudio } from '../context/AudioContext';

/** Music library page displaying all tracks as a grid of playable cards. */
const Music = () => {
  const { playlist, playTrack, currentTrack, isPlaying } = useAudio();
  const { t } = useTranslation('music');

  return (
    <div className="min-h-screen bg-surface">
        <SEO
          title={t('page_title', 'Music')}
          description={t('page_description', 'Original compositions from film scores, electronic music, and experimental sound design.')}
        />

        {/* HERO SECTION */}
        <MusicHero />

        {/* LIBRARY GRID */}
        <section className="pt-16 pb-28 px-6 md:px-12 lg:px-16 bg-surface relative z-20">
            <div className="max-w-content-wide mx-auto">
                <div className="flex items-center justify-between mb-12 border-b border-border pb-4">
                    <h2 className="text-h1 font-display text-text-primary">{t('music.library', 'Library')}</h2>
                    <span className="text-sm font-mono text-text-tertiary">{playlist.length} {t('music.releases', 'Releases')}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {playlist.map((track, index) => (
                        <TrackCard
                            key={track.id}
                            track={track}
                            index={index}
                            isCurrent={currentTrack?.id === track.id}
                            isPlaying={isPlaying}
                            onPlay={playTrack}
                        />
                    ))}
                </div>
            </div>
        </section>

    </div>
  );
};

export default Music;
