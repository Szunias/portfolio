import { useState } from 'react';

interface ImageWithLoaderProps {
  src: string;
  alt: string;
  className?: string;
  loading?: "lazy" | "eager";
}

const ImageWithLoader = ({ src, alt, className = "", loading = "lazy" }: ImageWithLoaderProps) => {
  const [isLoaded, setIsLoaded] = useState(loading === "eager"); // If eager, assume loaded/show immediately

  return (
    <div className={`relative overflow-hidden bg-primary ${className}`}>
      {/* Skeleton only if not loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-white/5 animate-pulse z-0" />
      )}
      
      <img
        src={src}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        className={`
          w-full h-full object-cover z-10 relative transition-opacity duration-500
          ${isLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </div>
  );
};

export default ImageWithLoader;