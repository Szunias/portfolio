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

      <Showreel />

      {/* Featured Projects Section */}
      <section id="projects" className="py-20 relative">
        {/* Ambient Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-[40vw] h-[40vh] bg-accent/5 blur-[100px] rounded-full opacity-30"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold text-white mb-2 drop-shadow-[0_0_20px_rgba(56,189,248,0.2)]">
                {t('projects.featured_title', 'Selected Work')}
              </h2>
              <div className="h-1 w-20 bg-accent rounded shadow-[0_0_10px_rgba(56,189,248,0.5)]"></div>
            </div>
            <Link 
              to="/projects" 
              className="hidden md:flex items-center text-accent hover:text-white transition-all duration-300 group font-mono text-sm hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.4)]"
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
              className="inline-flex items-center px-6 py-3 border border-white/10 text-dim rounded-lg hover:border-accent hover:text-white hover:shadow-[0_0_20px_rgba(56,189,248,0.2)] transition-all duration-300 font-mono text-sm"
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