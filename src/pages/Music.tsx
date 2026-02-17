import { useAudio } from '../context/AudioContext';
import { useTranslation } from 'react-i18next';
import TrackCard from '../components/features/music/TrackCard';
import MusicHero from '../components/features/music/MusicHero';
import SEO from '../components/layout/SEO';

const Music = () => {
  const { playlist, playTrack, currentTrack, isPlaying } = useAudio();
  const { t } = useTranslation('music');

  return (
    <div className="min-h-screen bg-primary">
        <SEO
          title={t('page_title', 'Music')}
          description={t('page_description', 'Original compositions from film scores, electronic music, and experimental sound design.')}
        />

        {/* HERO SECTION */}
        <MusicHero />

        {/* LIBRARY GRID */}
        <section className="py-20 px-4 sm:px-8 bg-primary relative z-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12 border-b border-border pb-4">
                    <h2 className="text-2xl font-display text-cream-light">{t('music.library', 'Library')}</h2>
                    <span className="text-sm font-mono text-dim">{playlist.length} {t('music.releases', 'Releases')}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
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
