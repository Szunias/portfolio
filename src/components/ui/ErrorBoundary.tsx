import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import i18n from '@/i18n';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches unhandled rendering errors and displays a localized fallback UI.
 * Uses i18n.t() directly because class components cannot use hooks.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-8" role="alert">
          <div className="max-w-2xl w-full bg-secondary border border-border rounded-sm p-8">
            <h1 className="text-3xl font-display text-cream-light mb-4">
              {i18n.t('error.title', 'Something went wrong')}
            </h1>
            <p className="text-dim mb-6">
              {i18n.t('error.description', 'An unexpected error occurred. Please try refreshing the page.')}
            </p>
            {this.state.error && (
              <details className="mb-6">
                <summary className="text-sm text-dim cursor-pointer hover:text-white mb-2">
                  {i18n.t('error.details', 'Error details')}
                </summary>
                <pre className="bg-primary p-4 rounded-sm border border-border text-xs text-error overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-accent text-primary font-medium rounded-sm hover:bg-accent-light transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
            >
              {i18n.t('error.reload', 'Reload Page')}
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
