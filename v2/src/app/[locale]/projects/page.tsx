'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Link } from '@/i18n/routing';

interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  tags: string[];
  year: number;
}

const projects: Project[] = [
  {
    id: 'shadow-frames',
    title: 'Shadow Frames',
    category: 'gameAudio',
    thumbnail: '/assets/projects/shadow-frames.jpg',
    tags: ['Wwise', 'Unreal Engine', 'C++', 'Spatial Audio'],
    year: 2024,
  },
  {
    id: 'transientica',
    title: 'Transientica AudioLab',
    category: 'tools',
    thumbnail: '/assets/projects/transientica.jpg',
    tags: ['Python', 'Machine Learning', 'DSP', 'Audio Analysis'],
    year: 2024,
  },
  {
    id: 'not-today-darling',
    title: 'Not Today, Darling',
    category: 'gameAudio',
    thumbnail: '/assets/projects/ntd.jpg',
    tags: ['MetaSounds', 'Unreal Engine', 'Procedural Audio'],
    year: 2024,
  },
  {
    id: 'amorak',
    title: 'Amorak',
    category: 'soundDesign',
    thumbnail: '/assets/projects/amorak.jpg',
    tags: ['Reaper', 'Sound Design', 'Horror', 'Foley'],
    year: 2024,
  },
  {
    id: 'audioq',
    title: 'AudioQ VST Plugin',
    category: 'tools',
    thumbnail: '/assets/projects/audioq.jpg',
    tags: ['JUCE', 'C++', 'VST', 'Audio Plugin'],
    year: 2023,
  },
  {
    id: 'ray-animation',
    title: 'Ray Animation',
    category: 'music',
    thumbnail: '/assets/projects/ray.jpg',
    tags: ['Composition', 'Funk', 'Jazz', 'Animation'],
    year: 2023,
  },
  {
    id: 'akantilado',
    title: 'Akantilado',
    category: 'soundDesign',
    thumbnail: '/assets/projects/akantilado.jpg',
    tags: ['5.1 Surround', 'Sound Design', '3D Animation'],
    year: 2023,
  },
  {
    id: 'richter',
    title: 'Richter Film Score',
    category: 'music',
    thumbnail: '/assets/projects/richter.jpg',
    tags: ['Film Score', 'Orchestral', 'Composition'],
    year: 2023,
  },
];

const filterCategories = ['all', 'gameAudio', 'soundDesign', 'music', 'tools'];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredProjects =
    activeFilter === 'all'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-4">
            {t('intro.title')}
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            {t('intro.subtitle')}
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {filterCategories.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter(filter)}
            >
              {t(`filters.${filter}`)}
            </Button>
          ))}
        </motion.div>

        {/* Projects grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={cardVariants} layout>
                <Link href={`/projects/${project.id}`}>
                  <Card hover glow className="group h-full">
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
                      <div className="absolute inset-0 bg-surface-elevated flex items-center justify-center">
                        <span className="text-4xl text-text-muted">🎮</span>
                      </div>
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
                        <ExternalLink className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-accent text-sm font-medium">
                          {t(`filters.${project.category}`)}
                        </p>
                        <span className="text-text-muted text-sm">{project.year}</span>
                      </div>
                      <h3 className="text-lg font-display font-semibold mb-3 group-hover:text-accent transition-colors">
                        {project.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="muted" size="sm">
                            {tag}
                          </Badge>
                        ))}
                        {project.tags.length > 3 && (
                          <Badge variant="outline" size="sm">
                            +{project.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-xl text-text-secondary mb-2">{t('empty.title')}</p>
            <p className="text-text-muted">{t('empty.description')}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
