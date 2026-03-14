import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';

const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";

interface TechRevealProps {
  text: string;
  className?: string;
}

const TechReveal = ({ text, className }: TechRevealProps) => {
  const [display, setDisplay] = useState(text);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!isInView || prefersReducedMotion) {
      setDisplay(text);
      return;
    }

    let iterations = 0;

    const interval = setInterval(() => {
      setDisplay(
        text
          .split("")
          .map((_, index) => {
            if (index < iterations) {
              return text[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("")
      );

      if (iterations >= text.length) {
        clearInterval(interval);
      }

      iterations += 1 / 3; // Speed of reveal
    }, 30);

    return () => clearInterval(interval);
  }, [isInView, text, prefersReducedMotion]);

  return (
    <motion.span
      ref={ref}
      className={`font-mono inline-block ${className}`}
      aria-label={text}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : {}}
    >
      <span aria-hidden="true">{display}</span>
    </motion.span>
  );
};

export default TechReveal;
