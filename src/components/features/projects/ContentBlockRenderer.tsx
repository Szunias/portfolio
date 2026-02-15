import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Cpu, ZoomIn, X } from 'lucide-react';
import { ContentBlock } from '../../../types';
import MediaRenderer from '../../ui/MediaRenderer';
import { cn } from '../../../utils';

interface ContentBlockRendererProps {
  blocks?: ContentBlock[];
}

const StatsGridBlock = ({ items }: { items: { label: string; value: string }[] }) => {
  const { t } = useTranslation('projectDetail');
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-12 border-y border-white/10 py-8">
      {items.map((item, idx) => (
        <div key={idx} className="text-center px-2">
          <div className="text-2xl md:text-3xl font-display font-bold text-white mb-1 break-words hyphens-auto">{t(item.value, item.value)}</div>
          <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{t(item.label, item.label)}</div>
        </div>
      ))}
    </div>
  );
};

const SplitContentBlock = ({ block, onImageClick }: { block: ContentBlock; onImageClick?: (src: string) => void }) => {
  const { t } = useTranslation('projectDetail');

  const handleClick = () => {
    if (block.media && onImageClick) {
      onImageClick(block.media);
    }
  };

  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-16", block.reverseLayout && "lg:grid-flow-dense")}>
      <div className={cn(block.reverseLayout && "lg:col-start-2")}>
        {block.title && <h3 className="text-2xl font-bold text-white mb-6">{t(block.title, block.title)}</h3>}
        {block.content && (
            <div
                className="prose prose-invert max-w-none text-slate-300/90 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t(block.content, block.content) }}
            />
        )}
      </div>

      <div className={cn(block.reverseLayout && "lg:col-start-1")}>
        <div
          className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video relative group cursor-pointer"
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
             <ZoomIn className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
           </div>
        </div>
        {block.mediaCaption && <p className="text-xs text-center text-slate-500 mt-2 font-mono">{t(block.mediaCaption, block.mediaCaption)}</p>}
      </div>
    </div>
  );
};

const GenericBlock = ({ block }: { block: ContentBlock }) => {
    const { t } = useTranslation('projectDetail');
    return (
        <div className="border-l-2 border-accent/20 pl-6 md:pl-10 py-2 my-8">
            {block.title && <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3"><Cpu size={20} className="text-accent" /> {t(block.title, block.title)}</h3>}
            {block.content && (
                <div
                    className="prose prose-invert max-w-none text-slate-300 leading-relaxed mb-8"
                    dangerouslySetInnerHTML={{ __html: t(block.content, block.content) }}
                />
            )}
            {block.media && (
                <div className="rounded-xl overflow-hidden border border-white/10 bg-black aspect-video shadow-2xl mt-6">
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
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setLightboxImage(null)}
            aria-label="Close lightbox"
          >
            <X size={32} />
          </button>
          <img
            src={`/${lightboxImage}`}
            alt={t('gallery.enlarged_view', 'Enlarged view')}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ContentBlockRenderer;