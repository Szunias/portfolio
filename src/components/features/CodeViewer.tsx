import { useState, useRef, KeyboardEvent } from 'react';
import { CodeSnippet, CodeAnnotation } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, FileCode, Lightbulb, ChevronRight, Zap } from 'lucide-react';
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
    // Simple tokenization
    let result: JSX.Element[] = [];
    let remaining = line;
    let keyIndex = 0;

    // Match strings
    const stringRegex = /"[^"]*"/g;
    // Match comments
    const commentRegex = /\/\/.*/g;
    // Match numbers
    const numberRegex = /\b\d+\.?\d*f?\b/g;

    // Check for comment first
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

  // Simple word-by-word processing
  const parts = text.split(/(\s+|[{}();,<>:&*])/);

  parts.forEach((part, i) => {
    if (keywords.includes(part)) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-purple-400 font-medium">{part}</span>);
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
  const [activeAnnotation, setActiveAnnotation] = useState<CodeAnnotation | null>(null);
  const { t } = useTranslation();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  if (!snippets || snippets.length === 0) return null;

  const handleKeyDown = (e: KeyboardEvent, index: number) => {
    if (e.key === 'ArrowRight') {
      const next = (index + 1) % snippets.length;
      setActiveTab(next);
      setActiveAnnotation(null);
      tabsRef.current[next]?.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = (index - 1 + snippets.length) % snippets.length;
      setActiveTab(prev);
      setActiveAnnotation(null);
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

  const hasAnnotations = currentSnippet.annotations && currentSnippet.annotations.length > 0;

  return (
    <div className="my-8">
      {/* Header Card - What this code does */}
      <div className="bg-gradient-to-r from-accent/10 to-purple-500/10 border border-accent/20 rounded-t-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-accent/20 rounded-xl">
            <Code2 className="text-accent" size={24} />
          </div>
          <div className="flex-1">
            <h4 className="text-lg font-bold text-white mb-2">{currentSnippet.title}</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {currentSnippet.description}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap bg-slate-900 border-x border-accent/10">
        {snippets.map((snippet, index) => (
          <button
            key={index}
            ref={el => tabsRef.current[index] = el}
            role="tab"
            aria-selected={activeTab === index}
            onClick={() => { setActiveTab(index); setActiveAnnotation(null); }}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-xs font-medium border-b-2 transition-all outline-none",
              activeTab === index
                ? 'bg-slate-800/50 text-accent border-accent'
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800/30'
            )}
          >
            <FileCode size={14} className={activeTab === index ? 'text-accent' : ''} />
            <span className="truncate max-w-[120px]">{snippet.title.replace('.cpp', '').replace('.h', '')}</span>
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 border border-t-0 border-accent/10 rounded-b-2xl overflow-hidden bg-slate-950">

        {/* Code Panel - 2/3 width on large screens */}
        <div className="lg:col-span-2 relative">
          {/* Interactive hint */}
          {hasAnnotations && (
            <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2.5 flex items-center gap-3">
              <Lightbulb size={16} className="text-amber-400" />
              <span className="text-amber-200 text-sm">
                {t('code.hover_hint', 'Click highlighted lines to see explanations')}
              </span>
            </div>
          )}

          {/* Code with line numbers */}
          <div className="overflow-hidden">
            <div>
              {lines.map((line, i) => {
                const annotation = annotationMap.get(i + 1);
                const isActive = activeAnnotation?.line === i + 1;

                return (
                  <div
                    key={i}
                    onClick={() => annotation && setActiveAnnotation(isActive ? null : annotation)}
                    className={cn(
                      "flex group transition-all duration-150",
                      annotation && "cursor-pointer",
                      isActive && "bg-accent/20",
                      annotation && !isActive && "hover:bg-accent/10"
                    )}
                  >
                    {/* Line number */}
                    <div className={cn(
                      "w-14 flex-shrink-0 text-right pr-4 py-1 text-sm select-none border-r transition-colors",
                      annotation
                        ? isActive
                          ? "text-accent bg-accent/10 border-accent/30"
                          : "text-accent/60 border-accent/20"
                        : "text-slate-600 border-slate-800"
                    )}>
                      {i + 1}
                    </div>

                    {/* Code line */}
                    <div className="flex-1 py-1 pl-4 pr-6 min-w-0">
                      <pre className="text-[13px] leading-relaxed font-mono whitespace-pre-wrap break-all">
                        <code className="text-slate-200">
                          {annotation && (
                            <span className={cn(
                              "inline-block w-2 h-2 rounded-full mr-2 transition-all",
                              isActive
                                ? "bg-accent scale-125"
                                : "bg-accent/50 group-hover:bg-accent"
                            )} />
                          )}
                          {highlightedLines[i]}
                        </code>
                      </pre>
                    </div>

                    {/* Expand indicator */}
                    {annotation && (
                      <div className={cn(
                        "flex items-center pr-4 transition-all",
                        isActive ? "text-accent" : "text-slate-600 group-hover:text-accent/70"
                      )}>
                        <ChevronRight size={16} className={cn(
                          "transition-transform",
                          isActive && "rotate-90"
                        )} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Annotation Panel - 1/3 width on large screens */}
        <div className="lg:border-l border-t lg:border-t-0 border-accent/10 bg-slate-900/50">
          <div className="p-4 border-b border-accent/10">
            <h4 className="text-sm font-bold text-accent uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} />
              {t('code.explanation_title', 'Code Explanation')}
            </h4>
          </div>

          <div className="p-4 min-h-[200px]">
            <AnimatePresence mode="wait">
              {activeAnnotation ? (
                <motion.div
                  key={activeAnnotation.line}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Label */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-bold rounded uppercase">
                      {t('code.line', 'Line')} {activeAnnotation.line}
                    </span>
                  </div>

                  {/* Title */}
                  <h5 className="text-lg font-bold text-white mb-3">
                    {t(activeAnnotation.label, activeAnnotation.label)}
                  </h5>

                  {/* Explanation */}
                  <p className="text-slate-300 leading-relaxed text-[15px]">
                    {t(activeAnnotation.explanation, activeAnnotation.explanation)}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center text-center py-8"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                    <Lightbulb size={20} className="text-slate-500" />
                  </div>
                  <p className="text-slate-500 text-sm max-w-[200px]">
                    {t('code.select_line', 'Click a highlighted line to see what it does')}
                  </p>

                  {/* Quick legend */}
                  {hasAnnotations && (
                    <div className="mt-6 space-y-2 text-left w-full max-w-[220px]">
                      <p className="text-xs text-slate-600 uppercase tracking-wider mb-3">Quick Reference:</p>
                      {currentSnippet.annotations?.slice(0, 4).map((ann, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveAnnotation(ann)}
                          className="w-full flex items-center gap-2 text-left text-sm text-slate-400 hover:text-accent transition-colors p-2 rounded hover:bg-slate-800/50"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-accent/50" />
                          <span className="truncate">{t(ann.label, ann.label)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between text-xs text-slate-500 px-1">
        <span>{currentSnippet.language.toUpperCase()} • {lines.length} lines</span>
        {hasAnnotations && (
          <span className="text-accent/70">{currentSnippet.annotations?.length} interactive points</span>
        )}
      </div>
    </div>
  );
};

export default CodeViewer;
