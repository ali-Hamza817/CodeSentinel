import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-red-100 p-8 text-center space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">Application Error</h2>
              <p className="text-slate-500 text-sm leading-relaxed">
                CodeSentinel encountered an unexpected error. This might be due to missing project data or a temporary system glitch.
              </p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-left overflow-auto max-h-32 mb-4">
              <code className="text-xs text-red-700 font-mono italic">
                {this.state.error?.message}
              </code>
            </div>
            <Button 
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11"
            >
              <RefreshCcw className="w-4 h-4" />
              Restart Application
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
