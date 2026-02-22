import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';

import ProjectCard from '../components/features/ProjectCard';
import Showreel from '../components/features/Showreel';
import Hero from '../components/home/Hero';
import Skills from '../components/home/Skills';
import SEO from '../components/layout/SEO';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { sectionReveal, cardIn, stagger, noMotion } from '../constants/motion';

/** Landing page with hero, showreel video, featured projects grid, and skills section. */
const Home = () => {
  const { featured_projects } = usePortfolioData();
  const { t } = useTranslation(['home', 'projects']);
  const prefersReducedMotion = useReducedMotion();

  const displayProjects = (featured_projects || []).slice(0, 4);

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://igorszuniewicz.com",
    "name": "Igor Szuniewicz | Audio Designer & Developer",
    "description": "Portfolio of Igor Szuniewicz - Audio Designer & Developer specializing in Game Audio, Wwise/FMOD implementation, and Interactive Systems."
  };

  return (
    <>
      <SEO />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(websiteSchema)}</script>
      </Helmet>
      <Hero />

      {/* Showreel Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <Showreel />
      </div>

      {/* Section divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* Projects Section */}
      <section id="projects" className="pt-20 pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
            className="text-center mb-16"
          >
            <h2 className="text-5xl md:text-6xl font-display text-cream-light mb-6">
              {t('projects.featured_title', 'Selected Work')}
            </h2>

            <p className="text-dim text-lg max-w-2xl mx-auto mb-8">
              {t('projects.subtitle', 'A collection of my game audio and development projects')}
            </p>

            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 text-dim hover:text-cream transition-colors"
            >
              <span className="border-b border-border group-hover:border-accent transition-colors">
                {t('projects.view_all', 'View All Projects')}
              </span>
              <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>

          {/* Projects Grid — first project featured full-width */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={prefersReducedMotion ? noMotion.initial : cardIn.initial}
                whileInView={prefersReducedMotion ? noMotion.animate : cardIn.animate}
                viewport={{ once: true }}
                transition={prefersReducedMotion ? noMotion.transition : {
                  ...cardIn.transition,
                  delay: index * stagger.cards,
                }}
                className={index === 0 ? 'md:col-span-2' : ''}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </div>

          {/* Mobile View All Button */}
          <motion.div
            initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
            className="mt-12 text-center md:hidden"
          >
            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 px-8 py-4 border border-border text-dim rounded-sm hover:border-border-hover hover:text-cream transition-colors duration-200"
            >
              {t('projects.view_all', 'View All Projects')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Section divider */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="h-px bg-border" />
      </div>

      {/* Skills */}
      <Skills />
    </>
  );
};

export default Home;
