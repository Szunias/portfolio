import { useState, useRef, KeyboardEvent } from 'react';
import { CodeSnippet, CodeAnnotation } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, FileCode, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../utils';

interface CodeViewerProps {
  snippets: CodeSnippet[];
}

// Basic syntax highlighting for C++
const highlightCode = (code: string): JSX.Element[] => {
  const keywords = ['void', 'if', 'else', 'return', 'const', 'float', 'bool', 'class', 'public', 'private', 'protected', 'case', 'switch', 'default', 'for', 'while', 'nullptr', 'true', 'false', 'this', 'new', 'delete'];
  const types = ['FName', 'FVector', 'FHitResult', 'FCollisionQueryParams', 'UPhysicalMaterial', 'AActor', 'ACharacter', 'ABaseAnomaly', 'UCustomGameInstance', 'FAnomalyAudioSettings', 'UPROPERTY', 'UCLASS', 'UFUNCTION', 'DECLARE_DYNAMIC_MULTICAST_DELEGATE'];

  const lines = code.split('\n');

  return lines.map((line, lineIndex) => {
    let result: JSX.Element[] = [];
    let remaining = line;

    if (remaining.includes('//')) {
      const commentIndex = remaining.indexOf('//');
      const beforeComment = remaining.slice(0, commentIndex);
      const comment = remaining.slice(commentIndex);

      result.push(
        <span key={`before-${lineIndex}`}>{processTokens(beforeComment, keywords, types, lineIndex)}</span>
      );
      result.push(
        <span key={`comment-${lineIndex}`} className="text-slate-500 italic">{comment}</span>
      );
    } else {
      result.push(
        <span key={`line-${lineIndex}`}>{processTokens(remaining, keywords, types, lineIndex)}</span>
      );
    }

    return <span key={lineIndex}>{result}</span>;
  });
};

const processTokens = (text: string, keywords: string[], types: string[], lineIndex: number): JSX.Element[] => {
  const result: JSX.Element[] = [];
  const parts = text.split(/(\s+|[{}();,<>:&*])/);

  parts.forEach((part, i) => {
    if (keywords.includes(part)) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-purple-400 font-semibold">{part}</span>);
    } else if (types.some(t => part.includes(t))) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-cyan-400">{part}</span>);
    } else if (/^".*"$/.test(part)) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-amber-400">{part}</span>);
    } else if (/^\d+\.?\d*f?$/.test(part)) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-orange-400">{part}</span>);
    } else if (part.startsWith('m_') || part.startsWith('On')) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-green-400">{part}</span>);
    } else {
      result.push(<span key={`${lineIndex}-${i}`}>{part}</span>);
    }
  });

  return result;
};

const CodeViewer = ({ snippets }: CodeViewerProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedLine, setExpandedLine] = useState<number | null>(null);
  const { t } = useTranslation();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  if (!snippets || snippets.length === 0) return null;

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const next = (index + 1) % snippets.length;
      setActiveTab(next);
      setExpandedLine(null);
      tabsRef.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (index - 1 + snippets.length) % snippets.length;
      setActiveTab(prev);
      setExpandedLine(null);
      tabsRef.current[prev]?.focus();
    }
  };

  const currentSnippet = snippets[activeTab];
  const lines = currentSnippet.code.split('\n');
  const highlightedLines = highlightCode(currentSnippet.code);
  const annotationMap = new Map<number, CodeAnnotation>();

  if (currentSnippet.annotations) {
    currentSnippet.annotations.forEach(ann => {
      annotationMap.set(ann.line, ann);
    });
  }

  return (
    <div className="my-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2.5 bg-accent/20 rounded-xl">
          <Code2 className="text-accent" size={22} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{currentSnippet.title}</h3>
          <p className="text-slate-400 text-sm">{currentSnippet.description}</p>
        </div>
      </div>

      {/* Tab Pills */}
      {snippets.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {snippets.map((snippet, index) => (
            <button
              key={index}
              ref={el => tabsRef.current[index] = el}
              role="tab"
              aria-selected={activeTab === index}
              onClick={() => { setActiveTab(index); setExpandedLine(null); }}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all outline-none",
                activeTab === index
                  ? 'bg-accent text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              )}
            >
              <FileCode size={14} />
              <span>{snippet.title.replace('.cpp', '').replace('.h', '')}</span>
            </button>
          ))}
        </div>
      )}

      {/* Code Block */}
      <div className="bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="p-4">
          {lines.map((line, i) => {
            const annotation = annotationMap.get(i + 1);
            const isExpanded = expandedLine === i + 1;

            return (
              <div key={i}>
                {/* Code Line */}
                <div
                  onClick={() => annotation && setExpandedLine(isExpanded ? null : i + 1)}
                  className={cn(
                    "flex items-start gap-3 py-1 px-2 -mx-2 rounded-lg transition-all",
                    annotation && "cursor-pointer",
                    isExpanded && "bg-accent/15",
                    annotation && !isExpanded && "hover:bg-slate-800/80"
                  )}
                >
                  {/* Line number */}
                  <span className={cn(
                    "w-6 text-right text-xs font-mono select-none flex-shrink-0 pt-0.5",
                    annotation ? "text-accent" : "text-slate-600"
                  )}>
                    {i + 1}
                  </span>

                  {/* Code */}
                  <code className="text-sm font-mono text-slate-200 whitespace-pre-wrap break-all flex-1">
                    {highlightedLines[i]}
                  </code>

                  {/* Expand indicator */}
                  {annotation && (
                    <ChevronDown
                      size={16}
                      className={cn(
                        "text-accent flex-shrink-0 transition-transform mt-0.5",
                        isExpanded && "rotate-180"
                      )}
                    />
                  )}
                </div>

                {/* Inline Explanation */}
                <AnimatePresence>
                  {annotation && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="ml-9 my-2 p-3 bg-accent/10 border-l-2 border-accent rounded-r-lg">
                        <p className="text-accent font-semibold text-sm mb-1">
                          {t(annotation.label, annotation.label)}
                        </p>
                        <p className="text-slate-300 text-sm leading-relaxed">
                          {t(annotation.explanation, annotation.explanation)}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
        <span>{currentSnippet.language.toUpperCase()} • {lines.length} lines</span>
        {currentSnippet.annotations && currentSnippet.annotations.length > 0 && (
          <span className="text-accent/70">
            {currentSnippet.annotations.length} {t('code.annotations', 'annotations')}
          </span>
        )}
      </div>
    </div>
  );
};

export default CodeViewer;
