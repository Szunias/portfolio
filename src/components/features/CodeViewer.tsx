import { useState } from 'react';
import { CodeSnippet } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, FileCode } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CodeViewerProps {
  snippets: CodeSnippet[];
}

const CodeViewer = ({ snippets }: CodeViewerProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const { t } = useTranslation();

  if (!snippets || snippets.length === 0) return null;

  return (
    <div className="my-12 border border-slate-800 rounded-xl overflow-hidden bg-[#0d1117] shadow-2xl">
      {/* IDE Header / Tabs */}
      <div className="flex items-center bg-[#161b22] border-b border-slate-800 overflow-x-auto scrollbar-hide">
        <div className="px-4 py-3 text-slate-500 border-r border-slate-800">
            <Terminal size={18} />
        </div>
        {snippets.map((snippet, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`
              flex items-center gap-2 px-6 py-3 text-sm font-mono border-r border-slate-800 transition-colors min-w-max
              ${activeTab === index 
                ? 'bg-[#0d1117] text-accent border-t-2 border-t-accent' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-t-2 border-t-transparent'
              }
            `}
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
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="p-0"
          >
            {/* Description Panel */}
            {snippets[activeTab].description && (
                <div className="bg-slate-900/50 border-b border-slate-800 p-4 text-slate-400 italic text-sm">
                    // {snippets[activeTab].description}
                </div>
            )}

            <div className="flex">
                {/* Line Numbers */}
                <div className="hidden md:flex flex-col items-end px-4 py-6 text-slate-600 bg-[#0d1117] border-r border-slate-800/50 select-none">
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
      <div className="bg-[#161b22] border-t border-slate-800 px-4 py-1 flex justify-between items-center text-xs font-mono text-slate-500">
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
