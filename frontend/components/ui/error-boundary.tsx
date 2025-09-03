"use client";

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error?: Error; resetError: () => void }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-error/10 border border-error/20 rounded-xl p-6 max-w-md">
        <h2 className="text-xl font-semibold text-error mb-2">Etwas ist schiefgelaufen</h2>
        <p className="text-text-secondary mb-4">
          {error?.message || 'Ein unerwarteter Fehler ist aufgetreten.'}
        </p>
        <button
          onClick={resetError}
          className="px-4 py-2 bg-primary text-white rounded-lg 
                     hover:bg-primary-hover transition-colors"
        >
          Erneut versuchen
        </button>
      </div>
    </div>
  );
}
