'use client';

import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

interface Project {
  id: string;
  title: string;
  category: string;
  thumbnail: string;
  tags: string[];
}

const featuredProjects: Project[] = [
  {
    id: 'shadow-frames',
    title: 'Shadow Frames',
    category: 'Game Audio',
    thumbnail: '/assets/projects/shadow-frames.jpg',
    tags: ['Wwise', 'Unreal Engine', 'C++'],
  },
  {
    id: 'transientica',
    title: 'Transientica AudioLab',
    category: 'Audio Tool',
    thumbnail: '/assets/projects/transientica.jpg',
    tags: ['Python', 'ML', 'DSP'],
  },
  {
    id: 'not-today-darling',
    title: 'Not Today, Darling',
    category: 'Game Audio',
    thumbnail: '/assets/projects/ntd.jpg',
    tags: ['MetaSounds', 'Unreal Engine'],
  },
  {
    id: 'amorak',
    title: 'Amorak',
    category: 'Sound Design',
    thumbnail: '/assets/projects/amorak.jpg',
    tags: ['Reaper', 'Sound Design'],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

export default function FeaturedProjects() {
  const t = useTranslations('featured');
  const tButtons = useTranslations('buttons');

  return (
    <section className="py-24 md:py-32 bg-surface/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
            {t('title')}
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </motion.div>

        {/* Projects grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 mb-12"
        >
          {featuredProjects.map((project) => (
            <motion.div key={project.id} variants={cardVariants}>
              <Link href={`/projects/${project.id}`}>
                <Card hover glow className="group h-full">
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
                    <Image
                      src={project.thumbnail}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-accent/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-accent text-sm font-medium mb-2">
                      {project.category}
                    </p>
                    <h3 className="text-xl md:text-2xl font-display font-semibold mb-3 group-hover:text-accent transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <Badge key={tag} variant="muted" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* View all button */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <Link href="/projects">
            <Button variant="secondary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              {tButtons('viewAll')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
