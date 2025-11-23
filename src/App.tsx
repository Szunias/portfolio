import { Suspense, lazy, ComponentType } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ScrollToTop from './components/layout/ScrollToTop';
import PageLoader from './components/ui/PageLoader';

// Helper to handle chunk load errors (auto-reload once)
const safeLazy = (importFunc: () => Promise<{ default: ComponentType<any> }>) => {
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

  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/gradwork" element={<Gradwork />} />
            <Route path="/projects/transientica_audiolab" element={<Transientica />} />
            <Route path="/projects/sound-design" element={<SoundDesign />} />
            <Route path="/projects/middleware-optimization" element={<MiddlewareOptimization />} />
            <Route path="/projects/:id" element={<ProjectDetails />} />
            <Route path="/music" element={<Music />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;