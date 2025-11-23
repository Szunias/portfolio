import { useState, useRef, KeyboardEvent } from 'react';
import { CodeSnippet } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, FileCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

interface CodeViewerProps {
  snippets: CodeSnippet[];
}

const CodeViewer = ({ snippets }: CodeViewerProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  if (!snippets || snippets.length === 0) return null;

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const next = (index + 1) % snippets.length;
      setActiveTab(next);
      tabsRef.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (index - 1 + snippets.length) % snippets.length;
      setActiveTab(prev);
      tabsRef.current[prev]?.focus();
    }
  };

  return (
    <div className="my-12 border border-canvas-border rounded-xl overflow-hidden bg-canvas shadow-2xl">
      {/* IDE Header / Tabs */}
      <div 
        className="flex items-center bg-canvas-header border-b border-canvas-border overflow-x-auto scrollbar-hide"
        role="tablist"
        aria-label="Code Snippets"
      >
        <div className="px-4 py-3 text-slate-500 border-r border-canvas-border">
            <Terminal size={18} />
        </div>
        {snippets.map((snippet, index) => (
          <button
            key={index}
            ref={el => tabsRef.current[index] = el}
            role="tab"
            aria-selected={activeTab === index}
            aria-controls={`panel-${index}`}
            id={`tab-${index}`}
            tabIndex={activeTab === index ? 0 : -1}
            onClick={() => setActiveTab(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex items-center gap-2 px-6 py-3 text-sm font-mono border-r border-canvas-border transition-colors min-w-max outline-none focus:ring-2 focus:ring-accent/50 focus:ring-inset",
              activeTab === index 
                ? 'bg-canvas text-accent border-t-2 border-t-accent' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border-t-2 border-t-transparent'
            )}
          >
            <FileCode size={14} className={activeTab === index ? 'text-accent' : 'text-slate-600'} />
            {snippet.title}
          </button>
        ))}
      </div>

      {/* Code Content */}
      <div className="relative min-h-[400px] font-mono text-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            role="tabpanel"
            id={`panel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-0"
          >
            {/* Description Panel */}
            {snippets[activeTab].description && (
                <div className="bg-slate-900/50 border-b border-canvas-border p-4 text-slate-400 italic text-sm">
                    // {snippets[activeTab].description}
                </div>
            )}

            <div className="flex">
                {/* Line Numbers */}
                <div className="hidden md:flex flex-col items-end px-4 py-6 text-slate-600 bg-canvas border-r border-canvas-border select-none">
                    {snippets[activeTab].code.split('\n').map((_, i) => (
                        <span key={i} className="leading-relaxed">{i + 1}</span>
                    ))}
                </div>

                {/* Actual Code */}
                <div className="flex-1 p-6 overflow-x-auto">
                    <pre className="text-slate-300 leading-relaxed">
                        <code>{snippets[activeTab].code}</code>
                    </pre>
                </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Status Bar */}
      <div className="bg-canvas-header border-t border-canvas-border px-4 py-1 flex justify-between items-center text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>{t('code.live_server', 'LIVE SERVER')}</span>
        </div>
        <div className="uppercase">
            {snippets[activeTab].language} • UTF-8
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
