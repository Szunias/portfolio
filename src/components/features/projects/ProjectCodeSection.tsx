import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Code, ChevronDown } from 'lucide-react';

import CodeViewer from '@/components/features/CodeViewer';
import type { CodeSnippet } from '@/types/project';

interface ProjectCodeSectionProps {
  snippets: readonly CodeSnippet[];
}

const ProjectCodeSection = ({ snippets }: ProjectCodeSectionProps) => {
  const [showCode, setShowCode] = useState(false);
  const { t } = useTranslation('projectDetail');

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface-raised">
        <button
            onClick={() => setShowCode(!showCode)}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-overlay transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-inset"
        >
            <div className="flex items-center gap-3">
                <Code size={20} className="text-accent" />
                <span className="text-h4 font-display text-text-primary">{t('details.technical_dive', 'Technical Deep Dive')}</span>
                <span className="text-caption text-text-secondary font-mono hidden sm:inline">
                    {t('details.technical_dive_hint', 'Implementation details for programmers')}
                </span>
            </div>
            <ChevronDown
                size={20}
                className={`text-text-secondary transition-transform duration-300 ${showCode ? 'rotate-180' : ''}`}
            />
        </button>
        <div className={`transition-all duration-300 ease-in-out ${showCode ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="p-6 border-t border-border bg-surface">
                <CodeViewer snippets={snippets} />
            </div>
        </div>
    </div>
  );
};

export default ProjectCodeSection;
