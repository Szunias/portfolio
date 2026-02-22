import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, Loader2 } from 'lucide-react';

import type { ProjectImage } from '@/types';

interface ImageLightboxProps {
  images: readonly (string | ProjectImage)[];
}

const ImageLightbox = ({ images }: ImageLightboxProps) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; caption: string | null } | null>(null);
  const [lightboxLoading, setLightboxLoading] = useState(true);
  const { t } = useTranslation('common');

  // Close lightbox on Escape key
  useEffect(() => {
    if (!selectedImage) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [selectedImage]);

  const handleOpenLightbox = useCallback((src: string, caption: string | null) => {
    setLightboxLoading(true);
    setSelectedImage({ src, caption });
  }, []);

  const getImageData = (img: string | ProjectImage) => {
    if (typeof img === 'string') {
      return { src: img, caption: null };
    }
    return { src: img.src, caption: img.caption };
  };

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {images.map((img, i) => {
          const { src, caption } = getImageData(img);
          const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');

          return (
            <div key={i} className="group">
              <div
                onClick={() => !isVideo && handleOpenLightbox(src, caption)}
                className={`relative rounded-sm overflow-hidden border border-border ${!isVideo ? 'cursor-pointer hover:border-border-hover' : ''} transition-colors duration-200`}
              >
                {isVideo ? (
                  <video
                    src={`/${src}`}
                    className="w-full h-auto object-cover"
                    controls
                    preload="metadata"
                  />
                ) : (
                  <>
                    <img src={`/${src}`} alt={caption ? t(caption, caption) : 'Gallery image'} loading="lazy" className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.01]" />
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity p-3 border border-border-hover rounded-sm">
                        <ZoomIn size={24} className="text-cream" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              {caption && (
                <p className="mt-2 text-sm text-dim flex items-center gap-2">
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
            onClick={() => setSelectedImage(null)}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 border border-border hover:border-border-hover rounded-sm transition-colors duration-200"
            >
              <X size={24} className="text-cream" />
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
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
                <p className="mt-4 text-center text-dim">
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
