import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';

import App from './App';
import ErrorBoundary from './components/ui/ErrorBoundary';
import { AudioProvider } from './context/AudioContext';
import './i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </HelmetProvider>
  </ErrorBoundary>,
)