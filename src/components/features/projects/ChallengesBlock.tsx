import { useTranslation } from 'react-i18next';
import { AlertTriangle, CheckCircle2, Target } from 'lucide-react';

interface Challenge {
  challenge: string;
  problem: string;
  solution: string;
}

interface ChallengesBlockProps {
  challenges: Challenge[];
}

const ChallengesBlock = ({ challenges }: ChallengesBlockProps) => {
  const { t } = useTranslation('projectDetail');

  if (!challenges || challenges.length === 0) return null;

  return (
    <div className="my-20">
      <h3 className="text-2xl font-display font-bold text-white mb-8 flex items-center gap-3">
        <Target className="text-accent" size={28} />
        {t('project.challenges_title', 'Challenges & Solutions')}
      </h3>
      
      <div className="grid gap-6">
        {challenges.map((item, i) => (
          <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-white/20 transition-colors">
            <div className="p-6 md:p-8">
              <h4 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <span className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm font-mono">
                  {i + 1}
                </span>
                {t(item.challenge, item.challenge)}
              </h4>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Problem */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-red-400 text-sm font-mono uppercase tracking-wider">
                    <AlertTriangle size={16} />
                    {t('project.problem', 'Problem')}
                  </div>
                  <p className="text-slate-400 leading-relaxed">
                    {t(item.problem, item.problem)}
                  </p>
                </div>

                {/* Solution */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-green-400 text-sm font-mono uppercase tracking-wider">
                    <CheckCircle2 size={16} />
                    {t('project.solution', 'Solution')}
                  </div>
                  <p className="text-slate-300 leading-relaxed">
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