import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Cpu, ZoomIn, X } from 'lucide-react';

import MediaRenderer from '@/components/ui/MediaRenderer';
import type { ContentBlock } from '@/types';
import { cn } from '@/utils';

interface ContentBlockRendererProps {
  blocks?: readonly ContentBlock[];
}

import type { StatsGridItem } from '../../../types';

interface StatsGridBlockProps {
  items: readonly StatsGridItem[];
}

const StatsGridBlock = ({ items }: StatsGridBlockProps) => {
  const { t } = useTranslation('projectDetail');
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-12 border-y border-border py-8">
      {items.map((item, idx) => (
        <div key={idx} className="text-center px-2">
          <div className="text-2xl md:text-3xl font-display text-cream-light mb-1 break-words hyphens-auto">{t(item.value, item.value)}</div>
          <div className="text-[10px] font-label text-dim uppercase tracking-wide">{t(item.label, item.label)}</div>
        </div>
      ))}
    </div>
  );
};

interface SplitContentBlockProps {
  block: ContentBlock;
  onImageClick?: (src: string) => void;
}

const SplitContentBlock = ({ block, onImageClick }: SplitContentBlockProps) => {
  const { t } = useTranslation('projectDetail');

  const handleClick = () => {
    if (block.media && onImageClick) {
      onImageClick(block.media);
    }
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-16", block.reverseLayout && "lg:grid-flow-dense")}>
      <div className={cn(block.reverseLayout && "lg:col-start-2")}>
        {block.title && <h3 className="text-2xl font-display text-cream-light mb-6">{t(block.title, block.title)}</h3>}
        {block.content && (
            <div
                className="prose prose-invert max-w-none text-dim leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t(block.content, block.content) }}
            />
        )}
      </div>

      <div className={cn(block.reverseLayout && "lg:col-start-1")}>
        <div
          className="rounded-sm overflow-hidden border border-border bg-black aspect-video relative group cursor-pointer"
          onClick={handleClick}
        >
           {block.media && (
               <MediaRenderer
                  src={block.media}
                  alt={block.title}
                  controls={true}
                  className="w-full h-full object-cover"
               />
           )}
           <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
             <ZoomIn className="text-cream opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
           </div>
        </div>
        {block.mediaCaption && <p className="text-xs text-center text-dim mt-2 italic">{t(block.mediaCaption, block.mediaCaption)}</p>}
      </div>
    </div>
  );
};

interface GenericBlockProps {
  block: ContentBlock;
}

const GenericBlock = ({ block }: GenericBlockProps) => {
    const { t } = useTranslation('projectDetail');
    return (
        <div className="border-l-2 border-accent/20 pl-6 md:pl-10 py-2 my-8">
            {block.title && <h3 className="text-2xl font-display text-cream-light mb-4 flex items-center gap-3"><Cpu size={20} className="text-accent" /> {t(block.title, block.title)}</h3>}
            {block.content && (
                <div
                    className="prose prose-invert max-w-none text-dim leading-relaxed mb-8"
                    dangerouslySetInnerHTML={{ __html: t(block.content, block.content) }}
                />
            )}
            {block.media && (
                <div className="rounded-sm overflow-hidden border border-border bg-black aspect-video mt-6">
                    <MediaRenderer
                        src={block.media}
                        alt={block.title}
                        controls={true}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}
        </div>
    );
}

const ContentBlockRenderer = ({ blocks }: ContentBlockRendererProps) => {
  const { t } = useTranslation('common');
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Close lightbox on Escape key
  useEffect(() => {
    if (!lightboxImage) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [lightboxImage]);

  if (!blocks) return null;

  return (
    <>
      <div className="space-y-12">
        {blocks.map((block, idx) => {
          switch(block.type) {
              case 'stats_grid':
                  return block.items ? <StatsGridBlock key={idx} items={block.items} /> : null;
              case 'split_text_media':
                  return <SplitContentBlock key={idx} block={block} onImageClick={setLightboxImage} />;
              case 'text':
              default:
                  return <GenericBlock key={idx} block={block} />;
          }
        })}
      </div>

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image lightbox"
        >
          <button
            className="absolute top-6 right-6 text-dim hover:text-cream transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>
          <img
            src={`/${lightboxImage}`}
            alt={t('gallery.enlarged_view', 'Enlarged view')}
            className="max-w-full max-h-[90vh] object-contain rounded-sm"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ContentBlockRenderer;
