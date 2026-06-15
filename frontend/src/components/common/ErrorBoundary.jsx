import { Component } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';

// Top-level React error boundary. Catches render-time errors and shows a recoverable fallback.
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production this would report to an error tracker (Sentry, etc.).
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-500 dark:bg-rose-500/15">
            <FiAlertTriangle size={30} />
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-800 dark:text-white">Something went wrong</h1>
          <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            An unexpected error occurred while rendering this page. You can try again or reload the app.
          </p>
          {import.meta.env.DEV && this.state.error && (
            <pre className="mt-4 max-w-lg overflow-auto rounded-xl bg-slate-100 p-3 text-left text-xs text-rose-600 dark:bg-white/5">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-6 flex gap-3">
            <button onClick={this.handleReset} className="btn btn-primary">
              <FiRefreshCw className="h-4 w-4" /> Try again
            </button>
            <button onClick={() => (window.location.href = '/')} className="btn btn-outline">
              Go home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
