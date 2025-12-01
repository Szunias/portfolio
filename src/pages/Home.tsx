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

  // Combine projects logic: display featured + slice of additional if needed, 
  // or just stick to featured for home page to keep it clean. 
  // Let's show top 4 featured projects.
  const safeFeaturedProjects = featured_projects || [];
  const displayProjects = safeFeaturedProjects.slice(0, 4);

  return (
    <>
      <SEO /> {/* Default home metadata */}
      <Hero />
      
      <div id="showreel-section" className="relative z-40">
        <Showreel />
      </div>

      {/* Featured Projects Section */}
      <section id="projects" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-2">
                {t('projects.featured_title', 'Selected Work')}
              </h2>
              <div className="h-1 w-20 bg-accent rounded"></div>
            </div>
            <Link 
              to="/projects" 
              className="hidden md:flex items-center text-accent hover:text-white transition group font-mono text-sm"
            >
              {t('projects.view_all', 'View All Projects')}
              <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>

          <div className="mt-12 text-center md:hidden">
            <Link 
              to="/projects" 
              className="inline-flex items-center px-6 py-3 border border-white/10 text-dim rounded-lg hover:border-accent hover:text-white transition font-mono text-sm"
            >
              {t('projects.view_all', 'View All Projects')}
              <ArrowRight size={16} className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <Skills />
    </>
  );
};

export default Home;