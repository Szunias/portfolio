/**
 * Animation presets for framer-motion based on design system.
 * Each preset exports `initial`, `animate`, and `transition` objects
 * that can be spread directly onto motion components.
 */

// --- Page Transition ---
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.0, 0.0, 0.2, 1] }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.3, ease: [0.4, 0.0, 1, 1] }
  }
};

// --- Stagger Children (Project Grid, Skill Tags) ---
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

export const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1] }
  }
};

// --- Fade Up (Section Entrance, Scroll-triggered) ---
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.0, 0.0, 0.2, 1] }
  }
};

// --- Legacy Presets (for compatibility with existing imports) ---
export const hero = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const sectionReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

export const cardIn = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const detailIn = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

export const detailInRight = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

// --- Stagger delays by context ---
export const stagger = {
  cards: 0.08,
  tags: 0.03,
  timeline: 0.1,
  navItems: 0.06,
  skills: 0.05,
} as const;

// --- Spring configs for interactive elements ---
export const spring = {
  interactive: { type: 'spring' as const, stiffness: 300, damping: 25 },
  gentle: { type: 'spring' as const, stiffness: 200, damping: 20 },
};

// --- Reduced motion: static preset (no animation) ---
export const noMotion = {
  initial: { opacity: 1 },
  animate: { opacity: 1 },
  transition: { duration: 0 },
};
