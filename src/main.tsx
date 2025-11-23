import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n';
import { AudioProvider } from './context/AudioContext';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ui/ErrorBoundary';
import PageLoader from './components/ui/PageLoader';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <HelmetProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </HelmetProvider>
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
)