import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [isExiting, setIsExiting] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) {
      onComplete();
      return;
    }

    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2200);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete, shouldReduceMotion]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-surface flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Name Display */}
      <motion.h1
        className="font-display text-4xl md:text-5xl text-text-primary tracking-tight"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
      >
        Igor Szuniewicz
      </motion.h1>
    </motion.div>
  );
};

export default IntroAnimation;
