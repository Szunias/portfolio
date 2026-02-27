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
      <div className="bg-surface border-t border-border">
        <div className="max-w-content-wide mx-auto px-6 lg:px-8">
          <Showreel />
        </div>
      </div>

      {/* Projects Section */}
      <section id="projects" className="bg-surface py-16">
        <div className="max-w-content mx-auto px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={prefersReducedMotion ? noMotion.initial : sectionReveal.initial}
            whileInView={prefersReducedMotion ? noMotion.animate : sectionReveal.animate}
            viewport={{ once: true }}
            transition={prefersReducedMotion ? noMotion.transition : sectionReveal.transition}
            className="mb-12"
          >
            <h2 className="font-display text-h1 text-text-primary mb-4">
              {t('projects.featured_title', 'Selected Work')}
            </h2>

            <p className="text-text-secondary text-body max-w-2xl mb-6">
              {t('projects.subtitle', 'A collection of my game audio and development projects')}
            </p>

            <Link
              to="/projects"
              className="group inline-flex items-center gap-2 px-4 py-2 border border-border text-text-secondary rounded-md hover:border-accent hover:text-text-primary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
            >
              {t('projects.view_all', 'View All Projects')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>

          {/* Projects Grid */}
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
              className="group inline-flex items-center gap-2 px-6 py-3 border border-border text-text-secondary rounded-md hover:border-border-hover hover:text-text-primary hover:bg-surface-overlay focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface transition-all duration-200"
            >
              {t('projects.view_all', 'View All Projects')}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Skills */}
      <Skills />
    </>
  );
};

export default Home;
