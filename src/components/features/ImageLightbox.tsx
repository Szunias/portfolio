import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, ZoomIn, Loader2 } from 'lucide-react';

import type { ProjectImage } from '@/types';
import { spring, noMotion } from '@/constants/motion';

interface ImageLightboxProps {
  images: readonly (string | ProjectImage)[];
}

const getImageData = (img: string | ProjectImage) => {
  if (typeof img === 'string') {
    return { src: img, caption: null };
  }
  return { src: img.src, caption: img.caption };
};

const ImageLightbox = ({ images }: ImageLightboxProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [lightboxLoading, setLightboxLoading] = useState(true);
  const [videoErrors, setVideoErrors] = useState<Set<number>>(new Set());
  const { t } = useTranslation('common');
  const prefersReducedMotion = useReducedMotion();

  const selectedImage = selectedIndex !== null ? getImageData(images[selectedIndex]) : null;

  // Collect only image (non-video) indices for arrow navigation
  const imageIndices = images.reduce<number[]>((acc, img, i) => {
    const { src } = getImageData(img);
    if (!src.endsWith('.mp4') && !src.endsWith('.webm')) acc.push(i);
    return acc;
  }, []);

  // Lock body scroll and handle keyboard when lightbox is open
  useEffect(() => {
    if (selectedIndex === null) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedIndex(null);
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const currentPos = imageIndices.indexOf(selectedIndex);
        if (currentPos === -1) return;
        const nextPos = e.key === 'ArrowRight'
          ? (currentPos + 1) % imageIndices.length
          : (currentPos - 1 + imageIndices.length) % imageIndices.length;
        setLightboxLoading(true);
        setSelectedIndex(imageIndices[nextPos]);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, imageIndices]);

  const handleOpenLightbox = useCallback((index: number) => {
    setLightboxLoading(true);
    setSelectedIndex(index);
  }, []);

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {images.map((img, i) => {
          const { src, caption } = getImageData(img);
          const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');

          return (
            <div key={src} className="group">
              <div
                onClick={() => !isVideo && handleOpenLightbox(i)}
                onKeyDown={(e) => { if (!isVideo && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); handleOpenLightbox(i); } }}
                role={!isVideo ? 'button' : undefined}
                tabIndex={!isVideo ? 0 : undefined}
                aria-label={!isVideo ? t('gallery.open', 'Open image in lightbox') : undefined}
                className={`relative rounded-sm overflow-hidden border border-border ${!isVideo ? 'cursor-pointer hover:border-border-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface' : ''} transition-colors duration-200`}
              >
                {isVideo ? (
                  videoErrors.has(i) ? (
                    <div className="flex items-center justify-center bg-surface-raised text-text-secondary aspect-video">
                      <span className="text-xs">{t('media_unavailable', 'Media unavailable')}</span>
                    </div>
                  ) : (
                    <video
                      src={`/${src}`}
                      className="w-full h-auto object-cover"
                      controls
                      preload="metadata"
                      onError={() => setVideoErrors(prev => new Set(prev).add(i))}
                    />
                  )
                ) : (
                  <>
                    <img src={`/${src}`} alt={caption ? t(caption, caption) : 'Gallery image'} loading="lazy" className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity p-3 border border-border-hover rounded-sm">
                        <ZoomIn size={24} className="text-text-primary" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              {caption && (
                <p className="mt-2 text-sm text-text-secondary flex items-center gap-2">
                  <span className="text-accent font-mono text-xs">IMG:</span>
                  {t(caption, caption)}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
            role="dialog"
            aria-modal="true"
            aria-label={t('gallery.lightbox', 'Image lightbox')}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedIndex(null)}
              className="absolute top-4 right-4 p-2 border border-border hover:border-border-hover rounded-sm transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              aria-label={t('gallery.close', 'Close lightbox')}
            >
              <X size={24} className="text-text-primary" />
            </button>

            {/* Image */}
            <motion.div
              initial={prefersReducedMotion ? noMotion.initial : { scale: 0.95, opacity: 0 }}
              animate={prefersReducedMotion ? noMotion.animate : { scale: 1, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { scale: 0.95, opacity: 0 }}
              transition={prefersReducedMotion ? noMotion.transition : spring.interactive}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[85vh] cursor-default"
            >
              {lightboxLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 size={32} className="text-accent animate-spin" />
                </div>
              )}
              <img
                src={`/${selectedImage.src}`}
                alt={selectedImage.caption ? t(selectedImage.caption, selectedImage.caption) : t('gallery.enlarged_alt', 'Enlarged gallery image view')}
                className={`max-w-full max-h-[85vh] object-contain rounded-sm transition-opacity ${lightboxLoading ? 'opacity-0' : 'opacity-100'}`}
                onLoad={() => setLightboxLoading(false)}
              />
              {selectedImage.caption && (
                <p className="mt-4 text-center text-text-secondary">
                  {t(selectedImage.caption, selectedImage.caption)}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ImageLightbox;
