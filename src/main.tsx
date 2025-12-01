import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n';
import { AudioProvider } from './context/AudioContext';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ui/ErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </HelmetProvider>
  </ErrorBoundary>,
)