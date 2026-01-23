'use client';

import { useTranslations } from 'next-intl';
import { CheckCircle2, Trophy, Cpu, Activity, Music, Layers } from 'lucide-react';
import { Project } from '../../../types';

interface ProjectRichDetailsProps {
  project: Project;
}

const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
  <div className="py-8 border-t border-white/10 group">
    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3 group-hover:text-accent transition-colors duration-300">
      <Icon className="text-accent group-hover:drop-shadow-[0_0_15px_rgba(56,189,248,0.6)] transition-all duration-300" size={24} />
      {title}
    </h3>
    {children}
  </div>
);

const KeyValueGrid = ({ data }: { data: Record<string, string> }) => {
  const t = useTranslations();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="bg-white/5 p-4 rounded-lg border border-white/5 hover:border-accent/30 hover:bg-white/8 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] transition-all duration-300 group">
          <h4 className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2 group-hover:text-accent/80 transition-colors duration-300">
            {t(`project.fields.${key}`) || key.replace(/_/g, ' ')}
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed group-hover:text-white transition-colors duration-300">{t(value) || value}</p>
        </div>
      ))}
    </div>
  );
};

const ListSection = ({ items }: { items: string[] }) => {
  const t = useTranslations();
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-slate-300 hover:text-white transition-colors duration-300 group">
          <CheckCircle2 size={18} className="text-accent flex-shrink-0 mt-1 group-hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.6)] transition-all duration-300" />
          <span className="leading-relaxed">{t(item) || item}</span>
        </li>
      ))}
    </ul>
  );
};

const ProjectRichDetails = ({ project }: ProjectRichDetailsProps) => {
  const t = useTranslations('project');

  return (
    <div className="space-y-4">

      {/* Responsibilities */}
      {project.responsibilities && project.responsibilities.length > 0 && (
        <Section title={t('responsibilities')} icon={Layers}>
          <ListSection items={project.responsibilities} />
        </Section>
      )}

      {/* Technical Achievements */}
      {project.technical_achievements && (
        <Section title={t('achievements')} icon={Trophy}>
          <KeyValueGrid data={project.technical_achievements} />
        </Section>
      )}

      {/* Audio Systems */}
      {project.audio_systems && (
        <Section title={t('audio_systems')} icon={Music}>
          <KeyValueGrid data={project.audio_systems} />
        </Section>
      )}

      {/* Performance Metrics */}
      {project.performance_metrics && (
        <Section title={t('metrics')} icon={Activity}>
          <KeyValueGrid data={project.performance_metrics} />
        </Section>
      )}

      {/* Technical Stack */}
      {project.technical_stack && (
        <Section title={t('tech_stack')} icon={Cpu}>
          <KeyValueGrid data={project.technical_stack} />
        </Section>
      )}

       {/* Key Scenes (Animation) */}
       {project.key_scenes && project.key_scenes.length > 0 && (
        <Section title={t('key_scenes')} icon={Music}>
          <ListSection items={project.key_scenes} />
        </Section>
      )}

    </div>
  );
};

export default ProjectRichDetails;