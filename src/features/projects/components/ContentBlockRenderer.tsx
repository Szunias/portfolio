import { useTranslation } from 'react-i18next';
import { Cpu } from 'lucide-react';
import { ContentBlock } from '../../../types';

interface ContentBlockRendererProps {
  blocks?: ContentBlock[];
}

const StatsGridBlock = ({ items }: { items: { label: string; value: string }[] }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-12 border-y border-white/10 py-8">
    {items.map((item, idx) => (
      <div key={idx} className="text-center">
        <div className="text-2xl md:text-3xl font-display font-bold text-white mb-1">{item.value}</div>
        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{item.label}</div>
      </div>
    ))}
  </div>
);

const SplitContentBlock = ({ block }: { block: ContentBlock }) => {
  const { t } = useTranslation();
  const isVideo = block.media?.endsWith('.mp4') || block.media?.endsWith('.webm');
  
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center my-16 ${block.reverseLayout ? 'lg:grid-flow-dense' : ''}`}>
      <div className={`${block.reverseLayout ? 'lg:col-start-2' : ''}`}>
        {block.title && <h3 className="text-2xl font-bold text-white mb-6">{t(block.title, block.title)}</h3>}
        {block.content && (
            <div 
                className="prose prose-invert max-w-none text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: t(block.content, block.content) }}
            />
        )}
      </div>
      
      <div className={`${block.reverseLayout ? 'lg:col-start-1' : ''}`}>
        <div className="rounded-xl overflow-hidden border border-white/10 shadow-2xl bg-black aspect-video">
          {isVideo ? (
            <video 
                src={`/${block.media}`} 
                className="w-full h-full object-cover" 
                autoPlay 
                loop 
                muted 
                playsInline 
                controls 
            />
          ) : (
            <img src={`/${block.media}`} alt={block.title || ''} className="w-full h-full object-cover" />
          )}
        </div>
        {block.mediaCaption && <p className="text-xs text-center text-slate-500 mt-2 font-mono">{block.mediaCaption}</p>}
      </div>
    </div>
  );
};

const GenericBlock = ({ block }: { block: ContentBlock }) => {
    const { t } = useTranslation();
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
                    {block.media.endsWith('.mp4') ? (
                        <video src={`/${block.media}`} className="w-full h-full object-cover" autoPlay loop muted playsInline controls />
                    ) : (
                        <img src={`/${block.media}`} alt={block.title || ''} className="w-full h-full object-cover" />
                    )}
                </div>
            )}
        </div>
    );
}


const ContentBlockRenderer = ({ blocks }: ContentBlockRendererProps) => {
  if (!blocks) return null;

  return (
    <div className="space-y-12">
      {blocks.map((block, idx) => {
        switch(block.type) {
            case 'stats_grid':
                return block.items ? <StatsGridBlock key={idx} items={block.items} /> : null;
            case 'split_text_media':
                return <SplitContentBlock key={idx} block={block} />;
            case 'text':
            default:
                // For generic or text blocks, use the enhanced generic renderer
                return <GenericBlock key={idx} block={block} />;
        }
      })}
    </div>
  );
};

export default ContentBlockRenderer;