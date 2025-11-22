import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n';
import { AudioProvider } from './context/AudioContext';
import { HelmetProvider } from 'react-helmet-async';

// Error Boundary Component
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-900 text-white p-8 font-mono">
          <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
          <p className="bg-black/50 p-4 rounded border border-red-500 whitespace-pre-wrap">
            {this.state.error?.toString()}
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

// Simple loading component
const Loading = () => (
  <div className="min-h-screen bg-primary flex items-center justify-center">
    <div className="text-accent text-xl font-bold animate-pulse">
      Loading Portfolio...
    </div>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<Loading />}>
        <HelmetProvider>
          <AudioProvider>
            <App />
          </AudioProvider>
        </HelmetProvider>
      </Suspense>
    </ErrorBoundary>
  </React.StrictMode>,
)