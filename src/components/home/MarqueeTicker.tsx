import { motion, useReducedMotion } from 'framer-motion';

const ROW_1 = ['Wwise', 'FMOD', 'MetaSounds', 'C++', 'Reaper', 'JUCE'];
const ROW_2 = ['Unreal Engine', 'Unity', 'Python', 'Pro Tools', 'Max/MSP', 'Blueprints'];

const SEPARATOR = ' /// ';
const CYCLE_DURATION = 25;

/** Renders a single row string with separators, duplicated for seamless looping. */
const buildRowText = (items: readonly string[]): string =>
  items.join(SEPARATOR) + SEPARATOR;

interface TickerRowProps {
  items: readonly string[];
  direction: 'left' | 'right';
  reduced: boolean | null;
}

const TickerRow = ({ items, direction, reduced }: TickerRowProps) => {
  const rowText = buildRowText(items);

  if (reduced) {
    return (
      <div className="font-mono uppercase text-text-tertiary text-body-sm tracking-widest whitespace-nowrap overflow-hidden py-2">
        {rowText}
      </div>
    );
  }

  // We render two copies side by side so when one scrolls off, the other takes over
  const xFrom = direction === 'left' ? 0 : -50;
  const xTo = direction === 'left' ? -50 : 0;

  return (
    <div className="overflow-hidden py-2">
      <motion.div
        className="font-mono uppercase text-text-tertiary text-body-sm tracking-widest whitespace-nowrap"
        animate={{ x: [`${xFrom}%`, `${xTo}%`] }}
        transition={{
          x: {
            repeat: Infinity,
            repeatType: 'loop',
            duration: CYCLE_DURATION,
            ease: 'linear',
          },
        }}
      >
        {/* Two copies for seamless loop */}
        <span>{rowText}</span>
        <span>{rowText}</span>
      </motion.div>
    </div>
  );
};

/**
 * Decorative marquee ticker displaying tool/technology names
 * in two rows scrolling in opposite directions.
 * Replaces the Skills section on the Home page.
 */
const MarqueeTicker = () => {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section
      className="py-8 bg-surface border-t border-border border-b border-border overflow-hidden"
      aria-hidden="true"
    >
      <TickerRow items={ROW_1} direction="left" reduced={prefersReducedMotion} />
      <TickerRow items={ROW_2} direction="right" reduced={prefersReducedMotion} />
    </section>
  );
};

export default MarqueeTicker;
