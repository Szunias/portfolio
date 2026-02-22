import { Suspense, lazy, useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import IntroAnimation from './components/ui/IntroAnimation';
import { ROUTES } from './constants/routes';

/**
 * Wraps React.lazy with automatic recovery from chunk load failures.
 * On first failure: reloads the page (handles stale deployments).
 * On second failure: throws so the ErrorBoundary can catch it.
 * Uses sessionStorage to track reload attempts and prevent infinite loops.
 */
const safeLazy = (importFunc: () => Promise<{ default: ComponentType<unknown> }>) => {
  return lazy(() => {
    return importFunc().catch(error => {
      console.error("Chunk load failed", error);
      const hasReloaded = sessionStorage.getItem('chunk_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload', 'true');
        window.location.reload();
        return new Promise(() => { }); // Never resolves; page reloads instead
      }
      throw error;
    });
  });
};

const Home = safeLazy(() => import('./pages/Home'));
const Projects = safeLazy(() => import('./pages/Projects'));
const ProjectDetails = safeLazy(() => import('./pages/ProjectDetails'));
const About = safeLazy(() => import('./pages/About'));
const Contact = safeLazy(() => import('./pages/Contact'));
const Gradwork = safeLazy(() => import('./pages/Gradwork'));
const Transientica = safeLazy(() => import('./pages/Transientica'));
const SoundDesign = safeLazy(() => import('./pages/SoundDesign'));
const MiddlewareOptimization = safeLazy(() => import('./pages/MiddlewareOptimization'));
const Music = safeLazy(() => import('./pages/Music'));
const NotFound = safeLazy(() => import('./pages/NotFound'));

function App() {
  // Show intro animation only once per session
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('intro_shown');
  });

  useEffect(() => {
    // Clear the safeLazy reload flag now that the app loaded successfully
    sessionStorage.removeItem('chunk_reload');

    if (showIntro) {
      sessionStorage.setItem('intro_shown', 'true');
    }
  }, [showIntro]);

  return (
    <>
      {showIntro && <IntroAnimation onComplete={() => setShowIntro(false)} />}
      <Router>
        <ScrollToTop />
        <Layout>
          <Suspense fallback={
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-accent animate-pulse" />
            </div>
          }>
            <Routes>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.PROJECTS} element={<Projects />} />
              <Route path={ROUTES.GRADWORK} element={<Gradwork />} />
              <Route path={ROUTES.TRANSIENTICA} element={<Transientica />} />
              <Route path={ROUTES.SOUND_DESIGN} element={<SoundDesign />} />
              <Route path={ROUTES.MIDDLEWARE_OPTIMIZATION} element={<MiddlewareOptimization />} />
              <Route path={ROUTES.PROJECT_DETAILS} element={<ProjectDetails />} />
              <Route path={ROUTES.MUSIC} element={<Music />} />
              <Route path={ROUTES.ABOUT} element={<About />} />
              <Route path={ROUTES.CONTACT} element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </>
  );
}

export default App;