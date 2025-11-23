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

export default ErrorBoundary;
