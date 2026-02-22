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
    }, 2000);

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
      className="fixed inset-0 z-[9999] bg-primary flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: isExiting ? 0 : 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        <h1 className="font-display text-5xl sm:text-6xl text-cream-light tracking-wide">
          Igor Szuniewicz
        </h1>
        <p className="text-dim text-sm mt-3 font-mono tracking-wider">
          Audio Designer
        </p>
      </motion.div>
    </motion.div>
  );
};

export default IntroAnimation;
