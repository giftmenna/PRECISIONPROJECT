"use client";

import React from "react";
// @ts-ignore TS7016: Could not find module '@/components/ui/alert' or its corresponding type declarations.
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface DailyLessonErrorBoundaryProps {
  children: React.ReactNode;
}

interface DailyLessonErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class DailyLessonErrorBoundary extends React.Component<
  DailyLessonErrorBoundaryProps,
  DailyLessonErrorBoundaryState
> {
  constructor(props: DailyLessonErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can log the error to an error reporting service here
    console.error("Daily lesson error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="my-4">
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>
            <p className="mb-4">
              {this.state.error?.message || "An error occurred while loading the daily lesson."}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleRetry}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}