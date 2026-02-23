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
      transition={{ duration: 0.6 }}
    >
      {/* Animated Waveform */}
      <motion.div
        className="flex items-end gap-2.5 h-32 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: isExiting ? 0 : 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className="w-4 bg-accent rounded-sm origin-bottom"
            initial={{ scaleY: 0.3 }}
            animate={isExiting ? { scaleY: 0.3 } : { scaleY: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.2,
              delay: i * 0.1,
              repeat: isExiting ? 0 : Infinity,
              ease: 'easeInOut'
            }}
            style={{ height: '100%' }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
};

export default IntroAnimation;
