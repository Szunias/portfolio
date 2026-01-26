'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Play, X } from 'lucide-react';

export default function Showreel() {
  const t = useTranslations('showreel');
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <section className="py-24 md:py-32 bg-surface/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
              {t('title')}
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </motion.div>

          {/* Video preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative aspect-video max-w-4xl mx-auto rounded-2xl overflow-hidden group cursor-pointer"
            onClick={() => setIsOpen(true)}
          >
            {/* Thumbnail placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface flex items-center justify-center">
              <div className="text-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-accent flex items-center justify-center mx-auto mb-4 glow"
                >
                  <Play className="w-8 h-8 md:w-10 md:h-10 text-background ml-1" />
                </motion.div>
                <p className="text-text-secondary">{t('watch')}</p>
              </div>
            </div>

            {/* Animated border */}
            <div className="absolute inset-0 border-2 border-border rounded-2xl group-hover:border-accent/50 transition-colors" />
          </motion.div>
        </div>
      </section>

      {/* Video modal */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/95 backdrop-blur-xl"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 right-0 p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Video embed placeholder */}
            <div className="w-full h-full bg-surface-elevated rounded-xl flex items-center justify-center border border-border">
              <p className="text-text-secondary">Video player will be embedded here</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
}
