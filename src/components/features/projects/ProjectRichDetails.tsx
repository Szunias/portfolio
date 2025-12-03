import { useTranslation } from 'react-i18next';
import { CheckCircle2, Trophy, Cpu, Activity, Music, Layers } from 'lucide-react';
import { Project } from '../../../types';

interface ProjectRichDetailsProps {
  project: Project;
}

const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="py-8 border-t border-white/10">
    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
      <Icon className="text-accent" size={24} />
      {title}
    </h3>
    {children}
  </div>
);

const KeyValueGrid = ({ data }: { data: Record<string, string> }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="bg-white/5 p-4 rounded-lg border border-white/5">
          <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            {t(`project.fields.${key}`, key.replace(/_/g, ' '))}
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">{t(value, value)}</p>
        </div>
      ))}
    </div>
  );
};

const ListSection = ({ items }: { items: string[] }) => {
  const { t } = useTranslation();
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-slate-300">
          <CheckCircle2 size={18} className="text-accent flex-shrink-0 mt-1" />
          <span className="leading-relaxed">{t(item, item)}</span>
        </li>
      ))}
    </ul>
  );
};

const ProjectRichDetails = ({ project }: ProjectRichDetailsProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      
      {/* Responsibilities */}
      {project.responsibilities && project.responsibilities.length > 0 && (
        <Section title={t('project.responsibilities', 'Responsibilities')} icon={Layers}>
          <ListSection items={project.responsibilities} />
        </Section>
      )}

      {/* Technical Achievements */}
      {project.technical_achievements && (
        <Section title={t('project.achievements', 'Technical Achievements')} icon={Trophy}>
          <KeyValueGrid data={project.technical_achievements} />
        </Section>
      )}

      {/* Audio Systems */}
      {project.audio_systems && (
        <Section title={t('project.audio_systems', 'Audio Systems')} icon={Music}>
          <KeyValueGrid data={project.audio_systems} />
        </Section>
      )}

      {/* Performance Metrics */}
      {project.performance_metrics && (
        <Section title={t('project.metrics', 'Performance Metrics')} icon={Activity}>
          <KeyValueGrid data={project.performance_metrics} />
        </Section>
      )}

      {/* Technical Stack */}
      {project.technical_stack && (
        <Section title={t('project.tech_stack', 'Technical Stack')} icon={Cpu}>
          <KeyValueGrid data={project.technical_stack} />
        </Section>
      )}

       {/* Key Scenes (Animation) */}
       {project.key_scenes && project.key_scenes.length > 0 && (
        <Section title={t('project.key_scenes', 'Key Audio Scenes')} icon={Music}>
          <ListSection items={project.key_scenes} />
        </Section>
      )}

    </div>
  );
};

export default ProjectRichDetails;