import React from 'react';
import { performanceMonitor } from '../utils/performanceMonitoring';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  componentStack: string | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  componentName: string;
  isModern: boolean;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Default fallback component for errors
const DefaultErrorFallback: React.FC<{ error: Error; retry: () => void }> = ({ error, retry }) => (
  <div className="error-boundary-fallback" style={{
    padding: '20px',
    border: '1px solid #ff6b6b',
    borderRadius: '4px',
    backgroundColor: '#ffe0e0',
    color: '#d63031',
    margin: '10px 0'
  }}>
    <h3>⚠️ Something went wrong</h3>
    <details style={{ marginTop: '10px' }}>
      <summary>Error details</summary>
      <pre style={{ 
        fontSize: '12px', 
        marginTop: '10px', 
        padding: '10px', 
        backgroundColor: '#fff',
        border: '1px solid #ddd',
        borderRadius: '2px',
        overflow: 'auto'
      }}>
        {error.message}
      </pre>
    </details>
    <button 
      onClick={retry}
      style={{
        marginTop: '10px',
        padding: '8px 16px',
        backgroundColor: '#0984e3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      🔄 Try Again
    </button>
  </div>
);

export class ProductionErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: number | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      componentStack: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Update state with error info
    this.setState({
      errorInfo,
      componentStack: errorInfo.componentStack
    });

    // Record error in performance monitoring
    performanceMonitor.recordError(this.props.componentName, this.props.isModern);

    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error in ${this.props.componentName} (${this.props.isModern ? 'Modern' : 'Legacy'})`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.groupEnd();
    }

    // Send error to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportErrorToService(error, errorInfo);
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry for certain types of errors
    if (this.shouldAutoRetry(error)) {
      this.scheduleRetry();
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private shouldAutoRetry(error: Error): boolean {
    // Auto-retry for network-related errors or temporary failures
    const retryableErrors = [
      'ChunkLoadError',
      'NetworkError',
      'TypeError: Failed to fetch'
    ];

    return retryableErrors.some(retryableError => 
      error.message.includes(retryableError) || error.name.includes(retryableError)
    );
  }

  private scheduleRetry() {
    // Retry after 3 seconds for auto-retryable errors
    this.retryTimeoutId = window.setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        componentStack: null
      });
    }, 3000);
  }

  private reportErrorToService(error: Error, errorInfo: React.ErrorInfo) {
    // In a real application, this would send to a service like Sentry
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentName: this.props.componentName,
      isModern: this.props.isModern,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getUserId(),
      buildVersion: process.env.REACT_APP_VERSION || 'unknown'
    };

    // Log to console in development (replace with actual service call)
    console.warn('Error Report (would be sent to monitoring service):', errorReport);

    // Example: Send to Sentry or similar service
    // Sentry.captureException(error, { extra: errorReport });
  }

  private getUserId(): string {
    // Get user ID from your authentication system
    // This is a placeholder implementation
    return localStorage.getItem('userId') || 'anonymous';
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      componentStack: null
    });
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          retry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundaries
export function withErrorBoundary<P extends {}>(
  Component: React.ComponentType<P>,
  componentName: string,
  isModern: boolean
) {
  const WrappedComponent: React.FC<P> = (props) => (
    <ProductionErrorBoundary componentName={componentName} isModern={isModern}>
      <Component {...props} />
    </ProductionErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// Custom hook for error reporting
export function useErrorReporting(componentName: string, isModern: boolean) {
  const reportError = React.useCallback((error: Error, context?: string) => {
    performanceMonitor.recordError(componentName, isModern);
    
    if (process.env.NODE_ENV === 'development') {
      console.error(`Error in ${componentName} (${isModern ? 'Modern' : 'Legacy'})${context ? ` - ${context}` : ''}:`, error);
    }
    
    // Report to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      const errorReport = {
        message: error.message,
        stack: error.stack,
        componentName,
        isModern,
        context,
        timestamp: new Date().toISOString()
      };
      console.warn('Error Report:', errorReport);
    }
  }, [componentName, isModern]);

  return { reportError };
}

// Error boundary for modern components
export const ModernErrorBoundary: React.FC<{
  children: React.ReactNode;
  componentName: string;
}> = ({ children, componentName }) => (
  <ProductionErrorBoundary componentName={componentName} isModern={true}>
    {children}
  </ProductionErrorBoundary>
);

// Error boundary for legacy components
export const LegacyErrorBoundary: React.FC<{
  children: React.ReactNode;
  componentName: string;
}> = ({ children, componentName }) => (
  <ProductionErrorBoundary componentName={componentName} isModern={false}>
    {children}
  </ProductionErrorBoundary>
);

// Production monitoring integration
export interface ErrorMetrics {
  componentName: string;
  isModern: boolean;
  errorCount: number;
  errorRate: number;
  lastError: {
    message: string;
    timestamp: string;
  } | null;
}

export class ErrorMonitor {
  private static errorCounts: Map<string, number> = new Map();
  private static totalRenders: Map<string, number> = new Map();
  private static lastErrors: Map<string, { message: string; timestamp: string }> = new Map();

  static recordError(componentName: string, isModern: boolean, error: Error) {
    const key = `${componentName}-${isModern ? 'modern' : 'legacy'}`;
    
    // Update error count
    const currentCount = this.errorCounts.get(key) || 0;
    this.errorCounts.set(key, currentCount + 1);
    
    // Update last error
    this.lastErrors.set(key, {
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }

  static recordRender(componentName: string, isModern: boolean) {
    const key = `${componentName}-${isModern ? 'modern' : 'legacy'}`;
    const currentCount = this.totalRenders.get(key) || 0;
    this.totalRenders.set(key, currentCount + 1);
  }

  static getErrorMetrics(componentName: string, isModern: boolean): ErrorMetrics {
    const key = `${componentName}-${isModern ? 'modern' : 'legacy'}`;
    const errorCount = this.errorCounts.get(key) || 0;
    const totalRenders = this.totalRenders.get(key) || 1;
    const errorRate = errorCount / totalRenders;
    const lastError = this.lastErrors.get(key) || null;

    return {
      componentName,
      isModern,
      errorCount,
      errorRate,
      lastError
    };
  }

  static getAllErrorMetrics(): Record<string, ErrorMetrics> {
    const result: Record<string, ErrorMetrics> = {};
    const componentNames = new Set<string>();
    
    this.errorCounts.forEach((_, key) => {
      const componentName = key.split('-')[0];
      componentNames.add(componentName);
    });

    componentNames.forEach(componentName => {
      const legacyMetrics = this.getErrorMetrics(componentName, false);
      const modernMetrics = this.getErrorMetrics(componentName, true);
      
      result[`${componentName}-legacy`] = legacyMetrics;
      result[`${componentName}-modern`] = modernMetrics;
    });

    return result;
  }
}