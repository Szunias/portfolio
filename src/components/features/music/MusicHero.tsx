import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Play, Pause, Sparkles } from 'lucide-react';

import { useAudio } from '@/context/AudioContext';
import type { Track } from '@/types';
import { hero, detailIn, sectionReveal, noMotion } from '@/constants/motion';

const MusicHero = () => {
  const { currentTrack, isPlaying, togglePlay, playTrack, playlist } = useAudio();
  const { t, i18n } = useTranslation('music');
  const prefersReducedMotion = useReducedMotion();

  const displayTrack = currentTrack || playlist[0];

  const getDesc = (track: Track) => {
    const lang = i18n.language.split('-')[0];
    return track?.desc?.[lang as 'en'|'pl'|'nl'] || track?.desc?.['en'] || '';
  };

  if (!displayTrack && playlist.length === 0) {
      return (
        <section className="relative pt-32 pb-20 px-4 sm:px-8 overflow-hidden min-h-[60vh] flex items-center justify-center">
             <div className="text-center text-text-secondary">
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
                <div className="absolute inset-0 bg-surface/70 z-10"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent z-10"></div>
                {displayTrack && (
                    <img
                        src={`/${displayTrack.cover}`}
                        className="w-full h-full object-cover blur-[100px] opacity-30 scale-110"
                        alt=""
                        role="presentation"
                        aria-hidden="true"
                    />
                )}
            </motion.div>
        </AnimatePresence>

        <div className="max-w-7xl mx-auto w-full relative z-20">
            {displayTrack ? (
                <div className="grid grid-cols-1 md:grid-cols-[350px_1fr] gap-12 items-end">
                    {/* Cover Art */}
                    <motion.div
                        initial={prefersReducedMotion ? noMotion.initial : hero.initial}
                        animate={prefersReducedMotion ? noMotion.animate : hero.animate}
                        transition={prefersReducedMotion ? noMotion.transition : hero.transition}
                        key={displayTrack.id}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border group hover:border-border-hover transition-colors duration-200"
                    >
                        <img
                            src={`/${displayTrack.cover}`}
                            alt={displayTrack.title}
                            className="w-full h-full object-cover"
                        />
                        {/* Quick Play Overlay */}
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-center justify-center cursor-pointer hover:from-black/40 hover:via-black/10 transition-all duration-300"
                            onClick={() => currentTrack?.id === displayTrack.id ? togglePlay() : playTrack(displayTrack)}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (currentTrack?.id === displayTrack.id) togglePlay(); else playTrack(displayTrack); } }}
                            role="button"
                            tabIndex={0}
                            aria-label={isPlaying && currentTrack?.id === displayTrack.id ? t('music.pause', 'Pause') : t('music.play', 'Play')}
                        >
                            <div className="w-20 h-20 rounded-full border-2 border-border-hover bg-surface-overlay/20 backdrop-blur-sm flex items-center justify-center hover:scale-105 hover:border-accent hover:bg-accent/10 transition-all duration-200">
                                {isPlaying && currentTrack?.id === displayTrack.id ? (
                                    <Pause size={36} fill="currentColor" className="text-accent" />
                                ) : (
                                    <Play size={36} fill="currentColor" className="text-accent ml-1" />
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Track Details */}
                    <div className="flex flex-col gap-6">
                        <motion.div
                            initial={prefersReducedMotion ? noMotion.initial : detailIn.initial}
                            animate={prefersReducedMotion ? noMotion.animate : detailIn.animate}
                            transition={prefersReducedMotion ? noMotion.transition : detailIn.transition}
                            key={`info-${displayTrack.id}`}
                        >
                            <div className="flex items-center gap-2 mb-4">
                                {displayTrack.tags?.map(tag => (
                                    <span key={tag} className="px-3 py-1 rounded border border-border bg-accent/10 text-xs text-accent font-mono uppercase tracking-wide hover:border-accent/40 hover:bg-accent/15 transition-colors duration-200">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-5xl md:text-7xl font-display text-text-primary mb-2 leading-none">
                                {displayTrack.title}
                            </h1>
                            <p className="text-xl text-text-secondary font-light">
                                {t('music.by_artist', 'by')} <span className="text-text-primary">{displayTrack.artist || 'Igor Szuniewicz'}</span>
                            </p>
                        </motion.div>

                        <motion.p
                            initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
                            animate={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
                            transition={prefersReducedMotion ? noMotion.transition : { ...sectionReveal.transition, delay: 0.2 }}
                            className="text-text-secondary max-w-2xl leading-7 text-lg border-l-2 border-accent/40 pl-6"
                        >
                            {getDesc(displayTrack)}
                        </motion.p>
                    </div>
                </div>
            ) : (
                <div className="h-[400px] flex items-center justify-center text-text-secondary">
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
