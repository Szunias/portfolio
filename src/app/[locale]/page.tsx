'use client';

import { motion } from 'framer-motion';
import Hero from '@/components/home/Hero';
import ProjectCard from '@/components/features/ProjectCard';
import Skills from '@/components/home/Skills';
import Showreel from '@/components/features/Showreel';
import { usePortfolioData } from '@/hooks/usePortfolioData';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  const locale = useLocale();
  const { featured_projects } = usePortfolioData();
  const t = useTranslations('projects');

  const displayProjects = (featured_projects || []).slice(0, 4);

  return (
    <>
      <Hero />

      {/* Showreel Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Showreel />
      </div>

      {/* Projects Section */}
      <section id="projects" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display font-bold mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                {t('featured_title')}
              </span>
            </h2>

            <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
              {t('subtitle')}
            </p>

            <Link
              href={`/${locale}/projects`}
              className="group inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <span className="border-b border-slate-600 group-hover:border-accent transition-colors">
                {t('view_all')}
              </span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                }}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </div>

          {/* Mobile View All Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center md:hidden"
          >
            <Link
              href={`/${locale}/projects`}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-slate-400 rounded-xl hover:bg-white/10 hover:border-accent/40 hover:text-white transition-all"
            >
              {t('view_all')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Skills */}
      <Skills />
    </>
  );
}
