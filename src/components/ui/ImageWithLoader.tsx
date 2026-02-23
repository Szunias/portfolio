import { useState } from 'react';
import { ImageOff } from 'lucide-react';

import { cn } from '@/utils';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const ImageWithLoader = ({ src, alt, className = "", loading = "lazy" }: ImageWithLoaderProps) => {
  const [isLoaded, setIsLoaded] = useState(loading === "eager"); 
  const [hasError, setHasError] = useState(false);

  return (
    <div className={cn("relative overflow-hidden bg-surface w-full h-full", className)}>
      {/* Skeleton / Fallback */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-elevated to-secondary bg-[length:200%_100%] animate-pulse z-0" />
      )}
      
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-600">
            <ImageOff size={24} />
        </div>
      ) : (
        <img
            src={src}
            alt={alt}
            loading={loading}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => {
                setHasError(true);
                setIsLoaded(true);
            }}
            className={cn(
                "w-full h-full object-cover z-10 relative transition-opacity duration-500",
                isLoaded ? 'opacity-100' : 'opacity-0'
            )}
        />
      )}
    </div>
  );
};

export default ImageWithLoader;