import { motion } from 'framer-motion';
import Hero from '../components/home/Hero';
import ProjectCard from '../components/features/ProjectCard';
import Skills from '../components/home/Skills';
import Showreel from '../components/features/Showreel';
import SEO from '../components/layout/SEO';
import { usePortfolioData } from '../hooks/usePortfolioData';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  const { featured_projects } = usePortfolioData();
  const { t } = useTranslation();

  const displayProjects = (featured_projects || []).slice(0, 4);

  return (
    <>
      <SEO />
      <Hero />

      {/* Showreel */}
      <Showreel />

      {/* Projects */}
      <section id="projects" className="py-24 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex justify-between items-end mb-12"
          >
            <h2 className="text-3xl font-display font-bold text-white">
              {t('projects.featured_title', 'Selected Work')}
            </h2>
            <Link
              to="/projects"
              className="hidden md:flex items-center text-slate-400 hover:text-white gap-2 text-sm"
            >
              {t('projects.view_all', 'View All')}
              <ArrowRight size={14} />
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <ProjectCard project={project} index={index} />
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mt-12 text-center md:hidden"
          >
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-6 py-3 border border-white/10 text-slate-400 rounded-lg"
            >
              {t('projects.view_all', 'View All')}
              <ArrowRight size={14} />
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
