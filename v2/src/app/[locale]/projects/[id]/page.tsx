'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, Github, Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Link } from '@/i18n/routing';
import { use } from 'react';

interface ProjectDetails {
  id: string;
  title: string;
  category: string;
  description: string;
  features: string[];
  technologies: string[];
  year: number;
  links?: {
    demo?: string;
    github?: string;
    itch?: string;
  };
}

const projectsData: Record<string, ProjectDetails> = {
  'shadow-frames': {
    id: 'shadow-frames',
    title: 'Shadow Frames',
    category: 'Game Audio',
    description:
      'A horror game audio implementation project using Wwise and Unreal Engine. Features dynamic spatial audio, procedural soundscapes, and adaptive music system.',
    features: [
      'Dynamic spatial audio with real-time occlusion',
      'Procedural ambient soundscapes',
      'Adaptive music system responding to player state',
      'Custom C++ audio components for Unreal Engine',
    ],
    technologies: ['Wwise', 'Unreal Engine 5', 'C++', 'Blueprints', 'Spatial Audio'],
    year: 2024,
    links: {
      itch: 'https://itch.io/shadow-frames',
    },
  },
  transientica: {
    id: 'transientica',
    title: 'Transientica AudioLab',
    category: 'Audio Tool',
    description:
      'Machine learning-powered beatbox recognition system. Analyzes audio input to detect and classify beatbox sounds in real-time.',
    features: [
      'Real-time audio classification',
      'Custom ML model trained on beatbox samples',
      'Web-based interface for easy testing',
      'Exportable recognition data',
    ],
    technologies: ['Python', 'TensorFlow', 'librosa', 'Flask', 'React'],
    year: 2024,
    links: {
      github: 'https://github.com/iszfrn/transientica',
    },
  },
  'not-today-darling': {
    id: 'not-today-darling',
    title: 'Not Today, Darling',
    category: 'Game Audio',
    description:
      '4-player racing game audio implementation using MetaSounds in Unreal Engine. Features procedural engine sounds and dynamic environmental audio.',
    features: [
      'Procedural engine audio using MetaSounds',
      'Dynamic tire and surface sounds',
      'Adaptive crowd and environment audio',
      'Positional audio for multiplayer',
    ],
    technologies: ['MetaSounds', 'Unreal Engine 5', 'Blueprints'],
    year: 2024,
  },
  amorak: {
    id: 'amorak',
    title: 'Amorak',
    category: 'Sound Design',
    description:
      'Horror animation sound design project. Created a complete soundscape including creature vocals, environmental ambiences, and tension-building elements.',
    features: [
      'Creature vocal design and processing',
      'Environmental ambience creation',
      'Foley recording and editing',
      'Final mix in 5.1 surround',
    ],
    technologies: ['Reaper', 'iZotope RX', 'Sound Design', 'Foley'],
    year: 2024,
  },
};

interface PageProps {
  params: Promise<{ id: string; locale: string }>;
}

export default function ProjectDetailsPage({ params }: PageProps) {
  const { id } = use(params);
  const t = useTranslations('projects.details');
  const project = projectsData[id];

  if (!project) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Project not found</h1>
          <Link href="/projects">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t('back')}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back button */}
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link href="/projects">
            <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              {t('back')}
            </Button>
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="accent">{project.category}</Badge>
            <span className="text-text-muted">{project.year}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            {project.title}
          </h1>
        </motion.div>

        {/* Media placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="aspect-video bg-surface-elevated rounded-xl border border-border mb-8 flex items-center justify-center"
        >
          <span className="text-6xl">🎬</span>
        </motion.div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <h2 className="text-xl font-semibold mb-4">{t('overview')}</h2>
            <p className="text-text-secondary leading-relaxed mb-8">
              {project.description}
            </p>

            <h2 className="text-xl font-semibold mb-4">{t('features')}</h2>
            <ul className="space-y-3 mb-8">
              {project.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-text-secondary">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4">{t('technologies')}</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {project.technologies.map((tech) => (
                  <Badge key={tech} variant="outline">
                    {tech}
                  </Badge>
                ))}
              </div>

              {project.links && (
                <>
                  <h3 className="text-lg font-semibold mb-4">{t('links')}</h3>
                  <div className="space-y-3">
                    {project.links.demo && (
                      <a
                        href={project.links.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" className="w-full" leftIcon={<ExternalLink className="w-4 h-4" />}>
                          {t('demo')}
                        </Button>
                      </a>
                    )}
                    {project.links.github && (
                      <a
                        href={project.links.github}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" className="w-full" leftIcon={<Github className="w-4 h-4" />}>
                          {t('github')}
                        </Button>
                      </a>
                    )}
                    {project.links.itch && (
                      <a
                        href={project.links.itch}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button variant="secondary" className="w-full" leftIcon={<Gamepad2 className="w-4 h-4" />}>
                          {t('itch')}
                        </Button>
                      </a>
                    )}
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
