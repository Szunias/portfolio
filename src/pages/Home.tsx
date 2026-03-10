import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

import Showreel from '../components/features/Showreel';
import Hero from '../components/home/Hero';
import MarqueeTicker from '../components/home/MarqueeTicker';
import StickyProjects from '../components/home/StickyProjects';
import SEO from '../components/layout/SEO';
import { usePortfolioData } from '../hooks/usePortfolioData';

/** Landing page with hero, showreel video, marquee ticker, and sticky project reveal. */
const Home = () => {
  const { featured_projects } = usePortfolioData();
  useTranslation(['home', 'projects']);

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

      <Showreel />

      <MarqueeTicker />

      {/* Projects — Sticky scroll reveal on desktop, cards on mobile */}
      <StickyProjects projects={displayProjects} />
    </>
  );
};

export default Home;
