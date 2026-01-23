'use client';

import { useState } from 'react';
import { cn } from '../../utils';
import { ImageOff } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface MediaRendererProps {
  src: string;
  alt?: string;
  className?: string;
  controls?: boolean;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
}

const MediaRenderer = ({
  src,
  alt = "",
  className,
  controls = false,
  autoPlay = true,
  loop = true,
  muted = true
}: MediaRendererProps) => {
  const [hasError, setHasError] = useState(false);
  const t = useTranslations('common');
  const isVideo = src.endsWith('.mp4') || src.endsWith('.webm');
  
  // Normalize path if needed (though assumed to be relative to public root if not http)
  const mediaSrc = src.startsWith('http') || src.startsWith('/') ? src : `/${src}`;

  if (hasError) {
      return (
        <div className={cn("flex items-center justify-center bg-neutral-900 text-neutral-600 aspect-video", className)}>
            <div className="flex flex-col items-center gap-2">
                <ImageOff size={24} />
                <span className="text-xs">{t('media_unavailable')}</span>
            </div>
        </div>
      );
  }

  if (isVideo) {
    return (
        <video 
            src={mediaSrc}
            className={cn("w-full h-full object-cover", className)}
            autoPlay={autoPlay}
            loop={loop}
            muted={muted}
            playsInline
            controls={controls}
            onError={() => setHasError(true)}
        />
    );
  }

  return (
    <img 
        src={mediaSrc} 
        alt={alt} 
        className={cn("w-full h-full object-cover", className)}
        onError={() => setHasError(true)}
        loading="lazy"
    />
  );
};

export default MediaRenderer;