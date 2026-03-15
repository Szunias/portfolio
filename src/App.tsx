import { Suspense, lazy, useState, useEffect } from 'react';
import type { ComponentType } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import IntroAnimation from './components/ui/IntroAnimation';
import PageLoader from './components/ui/PageLoader';
import { ROUTES } from './constants/routes';

/**
 * Wraps React.lazy with automatic recovery from chunk load failures.
 * On first failure for a given chunk: reloads the page (handles stale deployments).
 * On second failure for the same chunk: throws so the ErrorBoundary can catch it.
 * Uses sessionStorage with chunk-specific keys to track reload attempts per chunk.
 */
const safeLazy = (importFunc: () => Promise<{ default: ComponentType<unknown> }>) => {
  const chunkKey = `chunk_reload:${importFunc.toString().slice(0, 80)}`;
  return lazy(() => {
    return importFunc().catch(error => {
      console.error("Chunk load failed", error);
      const hasReloaded = sessionStorage.getItem(chunkKey);
      if (!hasReloaded) {
        sessionStorage.setItem(chunkKey, 'true');
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
const ShadowFrames = safeLazy(() => import('./pages/ShadowFrames'));
const NotTodayDarling = safeLazy(() => import('./pages/NotTodayDarling'));
const AudioQ = safeLazy(() => import('./pages/AudioQ'));
const RayAnimation = safeLazy(() => import('./pages/RayAnimation'));
const Amorak = safeLazy(() => import('./pages/Amorak'));
const MiddlewareOptimization = safeLazy(() => import('./pages/MiddlewareOptimization'));
const Richter = safeLazy(() => import('./pages/Richter'));
const Akantilado = safeLazy(() => import('./pages/Akantilado'));
const PauseAndDeserve = safeLazy(() => import('./pages/PauseAndDeserve'));
const Music = safeLazy(() => import('./pages/Music'));
const NotFound = safeLazy(() => import('./pages/NotFound'));

function App() {
  // Show intro animation only once per session
  const [showIntro, setShowIntro] = useState(() => {
    return !sessionStorage.getItem('intro_shown');
  });

  useEffect(() => {
    // Clear all safeLazy reload flags now that the app loaded successfully
    for (let i = sessionStorage.length - 1; i >= 0; i--) {
      const key = sessionStorage.key(i);
      if (key?.startsWith('chunk_reload:')) sessionStorage.removeItem(key);
    }

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
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.PROJECTS} element={<Projects />} />
              <Route path={ROUTES.GRADWORK} element={<Gradwork />} />
              <Route path={ROUTES.TRANSIENTICA} element={<Transientica />} />
              <Route path={ROUTES.SHADOW_FRAMES} element={<ShadowFrames />} />
              <Route path={ROUTES.NOT_TODAY_DARLING} element={<NotTodayDarling />} />
              <Route path={ROUTES.AUDIOQ} element={<AudioQ />} />
              <Route path={ROUTES.RAY_ANIMATION} element={<RayAnimation />} />
              <Route path={ROUTES.AMORAK} element={<Amorak />} />
              <Route path={ROUTES.SOUND_DESIGN} element={<SoundDesign />} />
              <Route path={ROUTES.MIDDLEWARE_OPTIMIZATION} element={<MiddlewareOptimization />} />
              <Route path={ROUTES.RICHTER} element={<Richter />} />
              <Route path={ROUTES.AKANTILADO} element={<Akantilado />} />
              <Route path={ROUTES.PAUSE_AND_DESERVE} element={<PauseAndDeserve />} />
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