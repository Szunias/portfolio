import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

import LogoMark from './Logo';

/**
 * "Tape Head" intro animation.
 * A thin vertical accent line sweeps left-to-right like a DAW playhead,
 * revealing the name behind it via clip-path. ~1.5s total.
 *
 * Escape key or click anywhere skips immediately.
 * prefers-reduced-motion skips entirely.
 * Gated to once-per-session in App.tsx via sessionStorage.
 */

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'sweep' | 'hold' | 'exit'>('sweep');
  const [visible, setVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const skip = useCallback(() => {
    setVisible(false);
  }, []);

  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete();
      return;
    }

    // sweep: 0-800ms, hold name: 800-1200ms, exit fade: 1200ms+
    const holdTimer = setTimeout(() => setPhase('hold'), 800);
    const exitTimer = setTimeout(() => setPhase('exit'), 1200);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete, shouldReduceMotion]);

  useEffect(() => {
    if (phase === 'exit') {
      const t = setTimeout(() => setVisible(false), 50);
      return () => clearTimeout(t);
    }
  }, [phase]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skip]);

  const handleExitComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  if (shouldReduceMotion) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[9999] bg-surface flex items-center justify-center overflow-hidden cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onClick={skip}
          role="presentation"
        >
          {/* Logo mark + Name — revealed by clip-path following the scan line */}
          <motion.div
            className="flex items-center gap-5 select-none"
            initial={{ clipPath: 'inset(0 100% 0 0)' }}
            animate={{ clipPath: 'inset(0 0% 0 0)' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <LogoMark size={48} className="text-accent flex-shrink-0 md:w-14 md:h-14 lg:w-16 lg:h-16" />
            <div className="flex flex-col">
              <span className="font-display text-3xl md:text-4xl lg:text-5xl text-text-primary tracking-tight">
                Igor Szuniewicz
              </span>
              <span className="text-xs md:text-sm text-accent uppercase tracking-[0.3em] font-mono mt-1">
                Audio Designer
              </span>
            </div>
          </motion.div>

          {/* Scan line — thin vertical accent bar sweeping L to R */}
          <motion.div
            className="absolute top-0 bottom-0 w-px bg-accent"
            style={{ boxShadow: '0 0 8px 1px rgba(45,212,168,0.4)' }}
            initial={{ left: '0%' }}
            animate={{ left: '100%' }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
