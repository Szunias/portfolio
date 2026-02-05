import { Suspense, lazy, ComponentType, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import { ROUTES } from './constants/routes';
import IntroAnimation from './components/ui/IntroAnimation';

// Helper to handle chunk load errors (auto-reload once)
const safeLazy = (importFunc: () => Promise<{ default: ComponentType<unknown> }>) => {
  return lazy(() => {
    return importFunc().catch(error => {
      console.error("Chunk load failed", error);
      // Check if we already tried to reload to avoid infinite loops
      const hasReloaded = sessionStorage.getItem('chunk_reload');
      if (!hasReloaded) {
        sessionStorage.setItem('chunk_reload', 'true');
        window.location.reload();
        return new Promise(() => { }); // Never resolve, page reloads
      }
      throw error; // If already reloaded, let the error boundary catch it
    });
  });
};

// Lazy load pages with safety
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
  // Clear reload flag on successful load
  sessionStorage.removeItem('chunk_reload');

  // Show intro animation only once per session
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('intro_shown');
  });

  useEffect(() => {
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