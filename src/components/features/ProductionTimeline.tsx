import { useTranslation } from 'react-i18next';

type WeekStatus = 'completed' | 'current' | 'upcoming';

interface Week {
  week: number;
  status: WeekStatus;
}

const weeks: Week[] = [
  { week: 1, status: 'completed' },
  { week: 2, status: 'completed' },
  { week: 3, status: 'completed' },
  { week: 4, status: 'completed' },
  { week: 5, status: 'completed' },
  { week: 6, status: 'completed' },
  { week: 7, status: 'completed' },
  { week: 8, status: 'current' },
  { week: 9, status: 'upcoming' },
];

const phases = [
  { label: 'timeline.prototype', start: 1, end: 2 },
  { label: 'timeline.production', start: 3, end: 7 },
  { label: 'timeline.polish', start: 8, end: 9 },
];

const ProductionTimeline = () => {
  const { t } = useTranslation();
  const currentWeek = weeks.find(w => w.status === 'current')?.week || 0;

  return (
    <div className="space-y-4">
      {/* Current status */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white">Week {currentWeek}</span>
        <span className="text-slate-500">of {weeks.length}</span>
        <span className="text-accent text-sm font-medium ml-auto">
          {t('timeline.polish', 'Polish')}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-accent rounded-full"
          style={{ width: `${((currentWeek - 0.5) / weeks.length) * 100}%` }}
        />
      </div>

      {/* Phase markers */}
      <div className="flex text-xs text-slate-500">
        {phases.map((phase, i) => (
          <div
            key={i}
            className="text-center"
            style={{ flex: phase.end - phase.start + 1 }}
          >
            <span className={currentWeek >= phase.start && currentWeek <= phase.end ? 'text-accent' : ''}>
              {t(phase.label)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductionTimeline;
