"use client";

import { Component, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  sectionName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`[ErrorBoundary${this.props.sectionName ? `:${this.props.sectionName}` : ""}]:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
            <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-slate-300 mb-1">
              Unable to load {this.props.sectionName || "this section"}
            </h3>
            <p className="text-slate-500 text-xs mb-4">
              Something went wrong while fetching data. Please try again.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2 rounded-lg text-xs transition-all border border-slate-700"
            >
              Try Again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
