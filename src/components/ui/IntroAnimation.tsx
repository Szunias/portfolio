import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const NUM_SNAKES = 5;

const colors = [
  '#38bdf8', // cyan
  '#a855f7', // purple
  '#22d3ee', // teal
  '#f472b6', // pink
  '#34d399', // green
];

interface Snake {
  id: number;
  color: string;
  duration: number;
  delay: number;
  path: string;
}

const generateSnakes = (): Snake[] => {
  return Array.from({ length: NUM_SNAKES }, (_, i) => {
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const cp1x = Math.random() * 100;
    const cp1y = Math.random() * 100;
    const cp2x = Math.random() * 100;
    const cp2y = Math.random() * 100;
    const endX = Math.random() * 100;
    const endY = Math.random() * 100;
    
    return {
      id: i,
      color: colors[i % colors.length],
      duration: 3 + Math.random() * 2,
      delay: i * 0.3,
      path: `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`,
    };
  });
};

const IntroAnimation = ({ onComplete }: { onComplete: () => void }) => {
  const [snakes] = useState<Snake[]>(generateSnakes);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit after animation plays
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, 2500);

    // Complete and unmount
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] bg-[#030303] flex items-center justify-center overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: isExiting ? 0 : 1 }}
      transition={{ duration: 1 }}
    >
      {/* Animated glowing snakes */}
      <svg 
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          {snakes.map((snake) => (
            <filter key={`glow-${snake.id}`} id={`glow-${snake.id}`}>
              <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          ))}
        </defs>

        {snakes.map((snake) => (
          <motion.path
            key={snake.id}
            d={snake.path}
            fill="none"
            stroke={snake.color}
            strokeWidth="0.3"
            strokeLinecap="round"
            filter={`url(#glow-${snake.id})`}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 1, 0],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: snake.duration,
              delay: snake.delay,
              ease: "easeInOut",
              times: [0, 0.4, 0.6, 1],
            }}
          />
        ))}

        {/* Additional flowing lines */}
        {snakes.map((snake, i) => (
          <motion.path
            key={`trail-${snake.id}`}
            d={snake.path}
            fill="none"
            stroke={snake.color}
            strokeWidth="0.15"
            strokeLinecap="round"
            opacity={0.5}
            filter={`url(#glow-${snake.id})`}
            initial={{ pathLength: 0 }}
            animate={{ 
              pathLength: [0, 1],
            }}
            transition={{
              duration: snake.duration * 1.5,
              delay: snake.delay + 0.2,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>

      {/* Center content */}
      <motion.div
        className="relative z-10 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: isExiting ? 0 : 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
      >
        <h1 className="font-display font-bold text-4xl sm:text-5xl text-white tracking-tight">
          IGOR SZUNIEWICZ
        </h1>
        <p className="text-dim text-sm mt-2 font-mono tracking-wider">
          Audio Designer
        </p>
      </motion.div>
    </motion.div>
  );
};

export default IntroAnimation;

