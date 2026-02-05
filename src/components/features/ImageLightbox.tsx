import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { ProjectImage } from '../../types';
import { useTranslation } from 'react-i18next';

interface ImageLightboxProps {
  images: (string | ProjectImage)[];
}

const ImageLightbox = ({ images }: ImageLightboxProps) => {
  const [selectedImage, setSelectedImage] = useState<{ src: string; caption: string | null } | null>(null);
  const { t } = useTranslation();

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
                onClick={() => !isVideo && setSelectedImage({ src, caption })}
                className={`relative rounded-xl overflow-hidden border border-white/10 bg-slate-900/50 ${!isVideo ? 'cursor-pointer hover:border-accent/50 hover:shadow-[0_0_30px_rgba(56,189,248,0.2)]' : ''} transition-all duration-500`}
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
                    <img src={`/${src}`} alt={caption ? t(caption, caption) : 'Gallery image'} loading="lazy" className="w-full h-auto object-cover transition-transform group-hover:scale-[1.02]" />
                    {/* Zoom overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full hover:scale-110 hover:shadow-[0_0_30px_rgba(56,189,248,0.5)]">
                        <ZoomIn size={24} className="text-accent drop-shadow-[0_0_10px_rgba(56,189,248,0.6)]" />
                      </div>
                    </div>
                  </>
                )}
              </div>
              {caption && (
                <p className="mt-2 text-sm text-slate-400 flex items-center gap-2">
                  <span className="text-accent font-medium">IMG:</span>
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
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-300 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-110"
            >
              <X size={24} className="text-white" />
            </button>

            {/* Image */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-w-[90vw] max-h-[85vh] cursor-default"
            >
              <img
                src={`/${selectedImage.src}`}
                alt={selectedImage.caption ? t(selectedImage.caption, selectedImage.caption) : t('gallery.enlarged_alt', 'Enlarged gallery image view')}
                className="max-w-full max-h-[85vh] object-contain rounded-lg"
              />
              {selectedImage.caption && (
                <p className="mt-4 text-center text-slate-300">
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
