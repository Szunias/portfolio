/**
 * Animation presets for framer-motion based on design system.
 * Each preset exports `initial`, `animate`, and `transition` objects
 * that can be spread directly onto motion components.
 */

// --- Standard easing ---
const easeStandard: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

// --- Standard viewport setting for whileInView ---
export const viewportOnce = { once: true, margin: '-80px' as const };

// --- Page Transition ---
export const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easeStandard }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: { duration: 0.2, ease: easeStandard }
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
    transition: { duration: 0.5, ease: easeStandard }
  }
};

// --- Fade Up (Section Entrance, Scroll-triggered) ---
export const fadeUpVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeStandard }
  }
};

// --- Fade In (no vertical movement) ---
export const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.5, ease: easeStandard }
  }
};

// --- Card Hover ---
export const cardHover = {
  whileHover: { y: -4 },
  transition: { duration: 0.3, ease: easeStandard },
};

// --- Legacy Presets (for compatibility with existing imports) ---
export const hero = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: easeStandard },
};

export const sectionReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: easeStandard },
};

export const cardIn = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.35, ease: easeStandard },
};

export const detailIn = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: easeStandard },
};

export const detailInRight = {
  initial: { opacity: 0, x: 16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: easeStandard },
};

// --- Stagger delays by context ---
export const stagger = {
  cards: 0.08,
  tags: 0.03,
  timeline: 0.1,
  navItems: 0.08,
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
