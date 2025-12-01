import { useTranslation } from 'react-i18next';
import { Check, Sparkles } from 'lucide-react';

type WeekStatus = 'completed' | 'current' | 'upcoming';

interface Week {
  week: number;
  status: WeekStatus;
  phase: string;
}

const weeks: Week[] = [
  { week: 1, status: 'completed', phase: 'prototype' },
  { week: 2, status: 'completed', phase: 'prototype' },
  { week: 3, status: 'completed', phase: 'production' },
  { week: 4, status: 'completed', phase: 'production' },
  { week: 5, status: 'completed', phase: 'production' },
  { week: 6, status: 'completed', phase: 'production' },
  { week: 7, status: 'completed', phase: 'production' },
  { week: 8, status: 'current', phase: 'polish' },
  { week: 9, status: 'upcoming', phase: 'polish' },
];

const ProductionTimeline = () => {
  const { t } = useTranslation();

  const currentWeek = weeks.find(w => w.status === 'current')?.week || 0;
  const completedCount = weeks.filter(w => w.status === 'completed').length;
  const progressPercent = ((completedCount + 0.5) / weeks.length) * 100;

  return (
    <div className="p-6 bg-slate-800/50 rounded-xl border border-slate-700/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-sm font-bold text-white uppercase tracking-wider">
          {t('timeline.title', 'Development Progress')}
        </h4>
        <div className="flex items-center gap-2">
          <span className="text-accent font-bold text-lg">Week {currentWeek}</span>
          <span className="text-slate-500 text-sm">/ {weeks.length}</span>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Background track */}
        <div className="absolute top-4 left-4 right-4 h-1 bg-slate-700 rounded-full" />

        {/* Progress track */}
        <div
          className="absolute top-4 left-4 h-1 bg-gradient-to-r from-green-500 to-accent rounded-full transition-all duration-500"
          style={{ width: `calc(${progressPercent}% - 32px)` }}
        />

        {/* Weeks */}
        <div className="relative flex items-center justify-between">
          {weeks.map((week) => (
            <div key={week.week} className="flex flex-col items-center">
              {/* Dot */}
              <div className={`
                relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                ${week.status === 'completed' ? 'bg-green-500' : ''}
                ${week.status === 'current' ? 'bg-accent shadow-lg shadow-accent/50' : ''}
                ${week.status === 'upcoming' ? 'bg-slate-700 border-2 border-slate-600' : ''}
              `}>
                {week.status === 'completed' && <Check size={14} className="text-white" strokeWidth={3} />}
                {week.status === 'current' && <Sparkles size={14} className="text-white" />}
              </div>

              {/* Week label */}
              <span className={`
                mt-2 text-xs font-bold
                ${week.status === 'completed' ? 'text-green-400' : ''}
                ${week.status === 'current' ? 'text-accent' : ''}
                ${week.status === 'upcoming' ? 'text-slate-600' : ''}
              `}>
                {week.week}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Phase labels */}
      <div className="flex mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex-[2] text-center">
          <span className="text-xs font-semibold text-green-400">{t('timeline.prototype', 'Prototype')}</span>
          <span className="text-xs text-slate-600 ml-1">(2w)</span>
        </div>
        <div className="flex-[5] text-center">
          <span className="text-xs font-semibold text-green-400">{t('timeline.production', 'Production')}</span>
          <span className="text-xs text-slate-600 ml-1">(5w)</span>
        </div>
        <div className="flex-[2] text-center">
          <span className="text-xs font-semibold text-accent">{t('timeline.polish', 'Polish')}</span>
          <span className="text-xs text-slate-600 ml-1">(2w)</span>
        </div>
      </div>
    </div>
  );
};

export default ProductionTimeline;
