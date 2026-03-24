import { useTranslation } from 'react-i18next';
import { CheckCircle2, Trophy, Cpu, Activity, Music, Layers } from 'lucide-react';

import type { Project } from '@/types';

interface ProjectRichDetailsProps {
  project: Project;
}

interface SectionProps {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}

const Section = ({ title, icon: Icon, children }: SectionProps) => (
  <div className="py-8 border-t border-border">
    <h3 className="text-h3 font-display text-text-primary mb-6 flex items-center gap-3">
      <Icon className="text-accent" size={24} />
      {title}
    </h3>
    {children}
  </div>
);

interface KeyValueGridProps {
  data: Readonly<Record<string, string>>;
}

const KeyValueGrid = ({ data }: KeyValueGridProps) => {
  const { t } = useTranslation('projectDetail');
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="bg-surface-raised p-5 rounded-xl border border-border hover:border-border-hover transition-colors duration-200">
          <h4 className="text-label font-mono text-text-tertiary uppercase mb-2">
            {t(`project.fields.${key}`, key.replace(/_/g, ' '))}
          </h4>
          <p className="text-text-primary text-body-sm leading-relaxed">{t(value, value)}</p>
        </div>
      ))}
    </div>
  );
};

interface ListSectionProps {
  items: readonly string[];
}

const ListSection = ({ items }: ListSectionProps) => {
  const { t } = useTranslation('projectDetail');
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-text-secondary hover:text-text-primary transition-colors duration-200">
          <CheckCircle2 size={18} className="text-accent flex-shrink-0 mt-1" />
          <span className="leading-relaxed text-body-sm">{t(item, item)}</span>
        </li>
      ))}
    </ul>
  );
};

const ProjectRichDetails = ({ project }: ProjectRichDetailsProps) => {
  const { t } = useTranslation('projectDetail');

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
