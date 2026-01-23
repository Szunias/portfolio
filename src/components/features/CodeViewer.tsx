'use client';

import { useState } from 'react';
import { CodeSnippet, CodeAnnotation } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { cn } from '../../utils';

interface CodeViewerProps {
  snippets: CodeSnippet[];
}

const highlightCode = (code: string): JSX.Element[] => {
  const keywords = ['void', 'if', 'else', 'return', 'const', 'float', 'bool', 'class', 'public', 'private', 'protected', 'case', 'switch', 'default', 'for', 'while', 'nullptr', 'true', 'false', 'this', 'new', 'delete'];
  const types = ['FName', 'FVector', 'FHitResult', 'FCollisionQueryParams', 'UPhysicalMaterial', 'AActor', 'ACharacter', 'ABaseAnomaly', 'UCustomGameInstance', 'FAnomalyAudioSettings', 'UPROPERTY', 'UCLASS', 'UFUNCTION', 'DECLARE_DYNAMIC_MULTICAST_DELEGATE'];

  const lines = code.split('\n');

  return lines.map((line, lineIndex) => {
    const result: JSX.Element[] = [];
    const remaining = line;

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
      result.push(<span key={`${lineIndex}-${i}`} className="text-[#c792ea]">{part}</span>);
    } else if (types.some(t => part.includes(t))) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-[#82aaff]">{part}</span>);
    } else if (/^".*"$/.test(part)) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-[#c3e88d]">{part}</span>);
    } else if (/^\d+\.?\d*f?$/.test(part)) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-[#f78c6c]">{part}</span>);
    } else if (part.startsWith('m_') || part.startsWith('On')) {
      result.push(<span key={`${lineIndex}-${i}`} className="text-[#89ddff]">{part}</span>);
    } else {
      result.push(<span key={`${lineIndex}-${i}`}>{part}</span>);
    }
  });

  return result;
};

const CodeViewer = ({ snippets }: CodeViewerProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [expandedLine, setExpandedLine] = useState<number | null>(null);
  const t = useTranslations();

  if (!snippets || snippets.length === 0) return null;

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
    <div className="rounded-lg overflow-hidden border border-slate-800 bg-[#1e1e2e]">
      {/* Window bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#181825] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#f38ba8]" />
            <div className="w-3 h-3 rounded-full bg-[#f9e2af]" />
            <div className="w-3 h-3 rounded-full bg-[#a6e3a1]" />
          </div>
        </div>

        {/* File tabs */}
        <div className="flex gap-1">
          {snippets.map((snippet, index) => (
            <button
              key={index}
              onClick={() => { setActiveTab(index); setExpandedLine(null); }}
              className={cn(
                "px-3 py-1 text-xs rounded transition-all",
                activeTab === index
                  ? 'bg-[#1e1e2e] text-white'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              {snippet.title}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-600">
          {currentSnippet.language.toUpperCase()}
        </div>
      </div>

      {/* Description */}
      {currentSnippet.description && (
        <div className="px-4 py-2 bg-[#181825]/50 border-b border-slate-800/50 text-sm text-slate-400">
          {currentSnippet.description}
        </div>
      )}

      {/* Code */}
      <div className="p-4 overflow-x-auto">
        {lines.map((_, i) => {
          const annotation = annotationMap.get(i + 1);
          const isExpanded = expandedLine === i + 1;

          return (
            <div key={i}>
              <div
                onClick={() => annotation && setExpandedLine(isExpanded ? null : i + 1)}
                className={cn(
                  "flex gap-4 py-0.5 px-2 -mx-2 rounded transition-colors",
                  annotation && "cursor-pointer",
                  isExpanded && "bg-accent/10",
                  annotation && !isExpanded && "hover:bg-white/5"
                )}
              >
                <span className={cn(
                  "w-8 text-right text-xs font-mono select-none",
                  annotation ? "text-accent" : "text-slate-600"
                )}>
                  {i + 1}
                </span>
                <code className="text-sm font-mono text-[#cdd6f4] whitespace-pre-wrap break-all flex-1">
                  {highlightedLines[i]}
                </code>
                {annotation && (
                  <span className="text-accent text-xs">●</span>
                )}
              </div>

              <AnimatePresence>
                {annotation && isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-12 my-2 p-3 bg-accent/5 border-l-2 border-accent rounded-r">
                      <p className="text-accent text-sm font-medium mb-1">
                        {t(annotation.label) || annotation.label}
                      </p>
                      <p className="text-slate-400 text-sm">
                        {t(annotation.explanation) || annotation.explanation}
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
  );
};

export default CodeViewer;
