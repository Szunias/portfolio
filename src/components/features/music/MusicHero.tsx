import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Sparkles } from 'lucide-react';
import { Track } from '../../../types';
import { useAudio } from '../../../context/AudioContext';

const MusicHero = () => {
  const { currentTrack, isPlaying, togglePlay, playTrack, playlist } = useAudio();
  const { t, i18n } = useTranslation('music');

  const displayTrack = currentTrack || playlist[0];

  const getDesc = (track: Track) => {
    const lang = i18n.language.split('-')[0];
    return track?.desc?.[lang as 'en'|'pl'|'nl'] || track?.desc?.['en'] || '';
  };

  if (!displayTrack && playlist.length === 0) {
      return (
        <section className="relative pt-32 pb-20 px-4 sm:px-8 overflow-hidden min-h-[60vh] flex items-center justify-center">
             <div className="text-center text-slate-500">
                <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
                <p>{t('music.loading', 'Loading library...')}</p>
            </div>
        </section>
      );
  }

  return (
    <section className="relative pt-32 pb-20 px-4 sm:px-8 overflow-hidden min-h-[60vh] flex items-center">
        {/* Ambient Background */}
        <AnimatePresence mode="wait">
            <motion.div 
                key={displayTrack?.id || 'empty'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 z-0"
            >
                <div className="absolute inset-0 bg-primary/60 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/80 to-transparent z-10"></div>
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
                        className="relative aspect-square rounded-xl overflow-hidden shadow-2xl border border-white/10 group hover:border-accent/40 hover:shadow-[0_0_50px_rgba(56,189,248,0.3)] transition-all duration-500"
                    >
                        <img 
                            src={`/${displayTrack.cover}`} 
                            alt={displayTrack.title} 
                            className="w-full h-full object-cover"
                        />
                        {/* Quick Play Overlay on Hero */}
                        <div 
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center cursor-pointer hover:from-black/40 hover:via-black/10 transition-all duration-300"
                            onClick={() => currentTrack?.id === displayTrack.id ? togglePlay() : playTrack(displayTrack)}
                            role="button"
                            aria-label={isPlaying && currentTrack?.id === displayTrack.id ? "Pause" : "Play"}
                        >
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center hover:scale-110 hover:bg-white/25 hover:border-accent/50 hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] transition-all duration-300">
                                {isPlaying && currentTrack?.id === displayTrack.id ? (
                                    <Pause size={36} fill="currentColor" className="text-accent drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" />
                                ) : (
                                    <Play size={36} fill="currentColor" className="text-accent ml-1 drop-shadow-[0_0_15px_rgba(56,189,248,0.6)]" />
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
                                    <span key={tag} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs text-accent font-mono uppercase tracking-wider hover:border-accent/50 hover:bg-accent/10 hover:shadow-[0_0_15px_rgba(56,189,248,0.2)] transition-all duration-300">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            
                            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-2 leading-none drop-shadow-[0_0_30px_rgba(56,189,248,0.2)]">
                                {displayTrack.title}
                            </h1>
                            <p className="text-xl text-slate-400 font-light">
                                by <span className="text-white hover:text-accent transition-colors duration-300">{displayTrack.artist || 'Igor Szuniewicz'}</span>
                            </p>
                        </motion.div>

                        <motion.p 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-300 max-w-2xl leading-relaxed text-lg border-l-2 border-accent/40 pl-6 shadow-[0_0_20px_rgba(56,189,248,0.1)]"
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
  );
};

export default MusicHero;