/**
 * Animation presets for framer-motion.
 * Each preset exports `initial`, `animate`, and `transition` objects
 * that can be spread directly onto motion components.
 */

// --- Preset: Hero ---
// Slower, further travel for primary hero elements
export const hero = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
};

// --- Preset: Section Reveal ---
// Subtle fade for section headings and content blocks
export const sectionReveal = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.4, ease: 'easeOut' },
};

// --- Preset: Card In ---
// Stagger-friendly entrance with slight scale for cards in grids
export const cardIn = {
  initial: { opacity: 0, y: 12, scale: 0.98 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
};

// --- Preset: Detail In ---
// Slide from side for detail/project page content
export const detailIn = {
  initial: { opacity: 0, x: -16 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
};

// Variant: slide from right
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
