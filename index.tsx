import React, { Component, ErrorInfo, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("App crashed:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-white bg-gray-900 min-h-screen flex flex-col items-center justify-center font-sans">
          <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
          <p className="mb-4 text-gray-300">The application crashed with the following error:</p>
          <pre className="bg-gray-800 p-4 rounded text-sm text-red-300 overflow-auto max-w-2xl border border-gray-700">
            {this.state.error?.message}
          </pre>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded text-white font-semibold transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);