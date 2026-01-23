'use client';

import { useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import ProjectGrid from '@/components/features/projects/ProjectGrid';
import ProjectFilters from '@/components/features/projects/ProjectFilters';
import { motion } from 'framer-motion';

export default function ProjectsPage() {
  const t = useTranslations('projects');
  const tCat = useTranslations('categories');
  const locale = useLocale();
  const { featured_projects = [], additional_projects = [] } = usePortfolioData();

  // Combine all projects
  const projects = [...featured_projects, ...additional_projects];

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = Array.from(new Set(projects.map((p) => p.category)));
    return ['All', ...uniqueCategories];
  }, [projects]);

  const [activeFilter, setActiveFilter] = useState('All');

  // Filter projects based on active category
  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [projects, activeFilter]);

  const getLabel = (cat: string) => {
    if (cat === 'All') return t('all') || 'All';
    return tCat(cat.toLowerCase().replace(/\s+/g, '_')) || cat;
  };

  return (
    <div className="min-h-screen bg-[#050508]">
      {/* Header Section */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                {t('all_title') || 'Projects'}
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl">
              {t('subtitle') || 'A collection of my work in game audio, sound design, and audio programming.'}
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ProjectFilters
              categories={categories}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              getLabel={getLabel}
            />
          </motion.div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            key={activeFilter}
          >
            <ProjectGrid projects={filteredProjects} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
