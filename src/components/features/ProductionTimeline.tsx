import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const ProductionTimeline = () => {
  const { t } = useTranslation('projectDetail');
  const [hoveredWeek, setHoveredWeek] = useState<number | null>(null);
  const currentWeek = 8;
  const totalWeeks = 9;

  const phases = [
    { name: t('timeline.prototype', 'Prototype'), weeks: [1, 2], color: 'bg-surface-overlay' },
    { name: t('timeline.production', 'Production'), weeks: [3, 4, 5, 6, 7], color: 'bg-text-tertiary' },
    { name: t('timeline.polish', 'Polish'), weeks: [8, 9], color: 'bg-accent' },
  ];

  const getPhaseForWeek = (week: number) => phases.find(p => p.weeks.includes(week))?.name || '';

  return (
    <div className="space-y-3">
      {/* Week indicator */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => (
            <div
              key={week}
              className="relative group"
              onMouseEnter={() => setHoveredWeek(week)}
              onMouseLeave={() => setHoveredWeek(null)}
            >
              <div
                className={`
                  w-3 h-3 rounded-full transition-all cursor-pointer
                  hover:scale-125
                  ${week < currentWeek ? 'bg-text-muted/40 hover:bg-text-muted/60' : ''}
                  ${week === currentWeek ? 'bg-accent w-4 h-4 ring-2 ring-accent/30' : ''}
                  ${week > currentWeek ? 'bg-surface-overlay/50 hover:bg-surface-overlay' : ''}
                `}
              />
              {/* Tooltip */}
              {hoveredWeek === week && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-surface-raised rounded-sm text-xs whitespace-nowrap z-10 border border-border">
                  <span className="text-text-primary font-medium">W{week}</span>
                  <span className="text-text-secondary ml-1">{getPhaseForWeek(week)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
        <span className="text-sm text-text-secondary ml-2">
          <span className="text-text-primary font-medium">{currentWeek}</span>/{totalWeeks}
        </span>
      </div>

      {/* Phase labels */}
      <div className="flex gap-4 text-xs">
        {phases.map((phase, i) => {
          const isActive = phase.weeks.includes(currentWeek);
          return (
            <div key={i} className="flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-sm ${phase.color}`} />
              <span className={isActive ? 'text-text-primary font-medium' : 'text-text-secondary'}>
                {phase.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionTimeline;
