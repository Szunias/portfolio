import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-primary flex items-center justify-center p-8" role="alert">
          <div className="max-w-2xl w-full bg-secondary border border-red-500/30 rounded-lg p-8 shadow-xl">
            <h1 className="text-3xl font-display font-bold text-white mb-4">
              Something went wrong
            </h1>
            <p className="text-dim mb-6">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            {this.state.error && (
              <details className="mb-6">
                <summary className="text-sm text-dim cursor-pointer hover:text-white mb-2">
                  Error details
                </summary>
                <pre className="bg-primary/50 p-4 rounded border border-white/10 text-xs text-red-400 overflow-auto max-h-64 whitespace-pre-wrap font-mono">
                  {this.state.error.toString()}
                  {this.state.error.stack && `\n\n${this.state.error.stack}`}
                </pre>
              </details>
            )}
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-accent text-primary font-medium rounded-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
