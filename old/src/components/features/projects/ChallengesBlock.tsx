import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Target } from 'lucide-react';

import type { ChallengeSolved } from '@/types';

interface ChallengesBlockProps {
  challenges: readonly ChallengeSolved[];
}

const ChallengesBlock = ({ challenges }: ChallengesBlockProps) => {
  const { t } = useTranslation('projectDetail');

  if (!challenges || challenges.length === 0) return null;

  return (
    <div className="my-16 lg:my-20">
      <h3 className="text-h2 font-display text-text-primary mb-8 flex items-center gap-3">
        <Target className="text-accent" size={28} />
        {t('project.challenges_title', 'Challenges & Solutions')}
      </h3>

      <div className="grid gap-5 lg:gap-6">
        {challenges.map((item, i) => (
          <div key={i} className="bg-surface-raised border border-border rounded-xl overflow-hidden hover:border-border-hover transition-colors duration-200">
            <div className="p-6 md:p-8">
              <h4 className="text-h4 font-display text-text-primary mb-6 flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-surface-overlay border border-border flex items-center justify-center text-sm font-mono text-text-secondary">
                  {i + 1}
                </span>
                {t(item.challenge, item.challenge)}
              </h4>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Problem */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-error/80 text-label font-mono uppercase">
                    <AlertTriangle size={16} />
                    {t('project.problem', 'Problem')}
                  </div>
                  <p className="text-text-secondary leading-relaxed text-body-sm">
                    {t(item.problem, item.problem)}
                  </p>
                </div>

                {/* Solution */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-success/80 text-label font-mono uppercase">
                    <CheckCircle2 size={16} />
                    {t('project.solution', 'Solution')}
                  </div>
                  <p className="text-text-primary leading-relaxed text-body-sm">
                    {t(item.solution, item.solution)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChallengesBlock;
