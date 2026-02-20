import { useState } from 'react';
import { cn } from '../../utils';
import { ImageOff } from 'lucide-react';

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
    <div className={cn("relative overflow-hidden bg-primary w-full h-full", className)}>
      {/* Skeleton / Fallback */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-secondary animate-pulse z-0" />
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