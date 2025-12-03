import { useState } from 'react';
import { Code, ChevronDown } from 'lucide-react';
import CodeViewer from '../CodeViewer';
import { CodeSnippet } from '../../../types/project';
import { useTranslation } from 'react-i18next';

interface ProjectCodeSectionProps {
  snippets: CodeSnippet[];
}

const ProjectCodeSection = ({ snippets }: ProjectCodeSectionProps) => {
  const [showCode, setShowCode] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
        <button
            onClick={() => setShowCode(!showCode)}
            className="w-full px-6 py-4 flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors"
        >
            <div className="flex items-center gap-3">
                <Code size={20} className="text-accent" />
                <span className="text-lg font-semibold text-white">{t('details.technical_dive', 'Technical Deep Dive')}</span>
                <span className="text-xs text-slate-500 font-mono hidden sm:inline">
                    {t('details.technical_dive_hint', 'Implementation details for programmers')}
                </span>
            </div>
            <ChevronDown
                size={20}
                className={`text-slate-400 transition-transform duration-300 ${showCode ? 'rotate-180' : ''}`}
            />
        </button>
        <div className={`transition-all duration-300 ease-in-out ${showCode ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-6 border-t border-white/10">
                <CodeViewer snippets={snippets} />
            </div>
        </div>
    </div>
  );
};

export default ProjectCodeSection;
