import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * The last line of defence: a render fault shows a recoverable panel rather
 * than a white screen, and the details stay in the console for a developer.
 */
interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  override componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('Unhandled rendering error', error, info.componentStack);
  }

  private reset = () => {
    this.setState({ error: null });
    window.location.assign('/');
  };

  override render(): React.ReactNode {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-app p-6">
        <div className="max-w-md w-full text-center space-y-4 bg-bg-surface border border-border rounded-2xl p-8 shadow-lg">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-status-absent/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-status-absent" strokeWidth={1.75} />
          </div>
          <h1 className="text-lg font-bold text-txt-primary">This screen ran into a problem</h1>
          <p className="text-xs text-txt-secondary leading-relaxed">
            The page could not finish loading. Your data is unaffected — returning to the dashboard usually clears it.
          </p>
          <button
            onClick={this.reset}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold hover:bg-brand-primary-600 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Back to the dashboard
          </button>
        </div>
      </div>
    );
  }
}
