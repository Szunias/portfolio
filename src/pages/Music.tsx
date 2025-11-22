import { useAudio } from '../context/AudioContext';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Sparkles } from 'lucide-react';
import TrackCard from '../components/features/music/TrackRow';

const Music = () => {
  const { playlist, playTrack, currentTrack, isPlaying, togglePlay } = useAudio();
  const { t, i18n } = useTranslation();

  const displayTrack = currentTrack || playlist[0];

  const getDesc = (track: any) => {
    const lang = i18n.language.split('-')[0];
    return track?.desc?.[lang] || track?.desc?.['en'] || '';
  };

  return (
    <div className="min-h-screen bg-[#050505]">
        
        {/* HERO SECTION (Now Playing / Featured) */}
        <section className="relative pt-32 pb-20 px-4 sm:px-8 overflow-hidden min-h-[60vh] flex items-center">
            {/* Ambient Background */}
            <AnimatePresence mode="wait">
                <motion.div 
                    key={displayTrack?.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0 z-0"
                >
                    <div className="absolute inset-0 bg-[#050505]/60 z-10"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent z-10"></div>
                    {displayTrack && (
                        <img 
                            src={`/${displayTrack.cover}`} 
                            className="w-full h-full object-cover blur-[100px] opacity-40 scale-110" 
                            alt="Ambience"
                        />
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="max-w-7xl mx-auto w-full relative z-20">
                {displayTrack ? (
                    <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-12 items-end">
                        {/* Cover Art */}
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={displayTrack.id}
                            className="relative aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/10 group"
                        >
                            <img 
                                src={`/${displayTrack.cover}`} 
                                alt={displayTrack.title} 
                                className="w-full h-full object-cover"
                            />
                            {/* Quick Play Overlay on Hero */}
                            <div 
                                className="absolute inset-0 bg-black/20 flex items-center justify-center cursor-pointer hover:bg-black/10 transition-colors"
                                onClick={() => currentTrack?.id === displayTrack.id ? togglePlay() : playTrack(displayTrack)}
                            >
                                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:scale-110 transition-transform">
                                    {isPlaying && currentTrack?.id === displayTrack.id ? (
                                        <Pause size={32} fill="currentColor" className="text-white" />
                                    ) : (
                                        <Play size={32} fill="currentColor" className="text-white ml-1" />
                                    )}
                                </div>
                            </div>
                        </motion.div>

                        {/* Track Details */}
                        <div className="flex flex-col gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={`info-${displayTrack.id}`}
                            >
                                <div className="flex items-center gap-2 mb-4">
                                    {displayTrack.tags?.map(tag => (
                                        <span key={tag} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-accent font-mono uppercase tracking-wider">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                
                                <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-2 leading-none">
                                    {displayTrack.title}
                                </h1>
                                <p className="text-xl text-slate-400 font-light">
                                    by <span className="text-white">{displayTrack.artist || 'Igor Szuniewicz'}</span>
                                </p>
                            </motion.div>

                            <motion.p 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="text-slate-300 max-w-2xl leading-relaxed text-lg border-l-2 border-accent/30 pl-6"
                            >
                                {getDesc(displayTrack)}
                            </motion.p>
                        </div>
                    </div>
                ) : (
                    <div className="h-[400px] flex items-center justify-center text-slate-500">
                        <div className="text-center">
                            <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                            <p>{t('music.select_track', 'Select a track to begin')}</p>
                        </div>
                    </div>
                )}
            </div>
        </section>

        {/* LIBRARY GRID */}
        <section className="py-20 px-4 sm:px-8 bg-primary relative z-20">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-2xl font-display font-bold text-white">{t('music.library', 'Library')}</h2>
                    <span className="text-sm font-mono text-slate-500">{playlist.length} {t('music.releases', 'Releases')}</span>
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