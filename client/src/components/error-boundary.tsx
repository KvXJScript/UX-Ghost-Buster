import { Component, type ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <div className="p-3 rounded-full bg-destructive/10 w-fit mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
              <p className="text-sm text-muted-foreground mb-4">
                An unexpected error occurred. Try refreshing the page or going back.
              </p>
              {this.state.error && (
                <pre className="text-[11px] text-muted-foreground font-mono bg-muted rounded-md p-3 mb-4 text-left overflow-x-auto">
                  {this.state.error.message}
                </pre>
              )}
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button onClick={this.handleReset} data-testid="button-error-retry">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = "/"} data-testid="button-error-home">
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
