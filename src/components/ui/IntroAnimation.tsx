import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * "Signal Check" intro animation.
 * Draws an audio-waveform SVG path left-to-right, then fades in the name,
 * then everything fades out together. Total ~1.8 s.
 *
 * Escape key or click anywhere skips immediately.
 * prefers-reduced-motion skips entirely.
 * Gated to once-per-session in App.tsx via sessionStorage.
 */

// Hand-crafted audio-waveform path — jagged peaks & valleys like a DAW waveform.
// viewBox is 800 x 200; the baseline sits at y=100.
const WAVEFORM_PATH = [
  'M 0 100',
  'L 20 100',
  'L 30 72',
  'L 40 118',
  'L 50 55',
  'L 60 135',
  'L 75 40',
  'L 85 150',
  'L 95 65',
  'L 105 125',
  'L 120 30',
  'L 130 160',
  'L 140 50',
  'L 155 130',
  'L 165 80',
  'L 180 110',
  'L 195 25',
  'L 210 165',
  'L 225 45',
  'L 240 140',
  'L 255 70',
  'L 270 115',
  'L 290 35',
  'L 305 155',
  'L 320 60',
  'L 335 130',
  'L 350 90',
  'L 365 105',
  'L 380 20',
  'L 395 170',
  'L 410 38',
  'L 430 145',
  'L 445 55',
  'L 460 120',
  'L 480 75',
  'L 495 110',
  'L 510 42',
  'L 525 148',
  'L 540 30',
  'L 560 158',
  'L 575 50',
  'L 590 135',
  'L 605 68',
  'L 620 118',
  'L 640 45',
  'L 655 150',
  'L 670 60',
  'L 685 125',
  'L 700 85',
  'L 715 108',
  'L 730 70',
  'L 745 115',
  'L 760 92',
  'L 780 100',
  'L 800 100',
].join(' ');

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'draw' | 'name' | 'exit'>('draw');
  const [visible, setVisible] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  const skip = useCallback(() => {
    setVisible(false);
  }, []);

  // Phase sequencing
  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete();
      return;
    }

    // draw: 0–800ms, pause 100ms, name fade in: 900–1300ms, exit starts at 1400ms
    const nameTimer = setTimeout(() => setPhase('name'), 900);
    const exitTimer = setTimeout(() => setPhase('exit'), 1400);

    return () => {
      clearTimeout(nameTimer);
      clearTimeout(exitTimer);
    };
  }, [onComplete, shouldReduceMotion]);

  // Start exit fade when phase reaches 'exit'
  useEffect(() => {
    if (phase === 'exit') {
      // Small delay so exit variant triggers, then remove
      const t = setTimeout(() => setVisible(false), 50);
      return () => clearTimeout(t);
    }
  }, [phase]);

  // Escape key to skip
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skip();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [skip]);

  // When AnimatePresence removes the element, call onComplete
  const handleExitComplete = useCallback(() => {
    onComplete();
  }, [onComplete]);

  if (shouldReduceMotion) return null;

  return (
    <AnimatePresence onExitComplete={handleExitComplete}>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[9999] bg-surface flex flex-col items-center justify-center overflow-hidden cursor-pointer"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          onClick={skip}
          role="presentation"
        >
          {/* SVG waveform — draws left to right */}
          <svg
            viewBox="0 0 800 200"
            className="w-[min(80vw,600px)] h-auto"
            fill="none"
            aria-hidden="true"
          >
            <motion.path
              d={WAVEFORM_PATH}
              stroke="currentColor"
              className="text-accent"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 1 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
            />
          </svg>

          {/* Name fades in after waveform draw */}
          <motion.h1
            className="font-display text-4xl md:text-5xl text-text-primary tracking-tight mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'name' || phase === 'exit' ? 1 : 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            Igor Szuniewicz
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IntroAnimation;
