import React from 'react';

// Performance metrics interface
export interface ComponentMetrics {
  componentName: string;
  renderTime: number;
  rerenderCount: number;
  memoryUsage: number;
  errorCount: number;
  userInteractionLatency: number;
  timestamp: string;
  isModern: boolean;
}

// Performance comparison interface
export interface PerformanceComparison {
  componentName: string;
  legacy: ComponentMetrics;
  modern: ComponentMetrics;
  improvement: {
    renderTimeImprovement: string;
    memoryReduction: string;
    errorReduction: string;
    overallScore: 'significant' | 'moderate' | 'minimal' | 'regression';
  };
}

// Performance monitoring class
class PerformanceMonitor {
  private metrics: Map<string, ComponentMetrics[]> = new Map();
  private renderStartTimes: Map<string, number> = new Map();
  private rerenderCounts: Map<string, number> = new Map();

  // Start measuring component performance
  startMeasurement(componentName: string, isModern: boolean): void {
    const key = `${componentName}-${isModern ? 'modern' : 'legacy'}`;
    this.renderStartTimes.set(key, performance.now());
    
    // Track rerender count
    const currentCount = this.rerenderCounts.get(key) || 0;
    this.rerenderCounts.set(key, currentCount + 1);
  }

  // End measuring component performance
  endMeasurement(componentName: string, isModern: boolean): ComponentMetrics {
    const key = `${componentName}-${isModern ? 'modern' : 'legacy'}`;
    const startTime = this.renderStartTimes.get(key) || performance.now();
    const renderTime = performance.now() - startTime;
    
    const metrics: ComponentMetrics = {
      componentName,
      renderTime,
      rerenderCount: this.rerenderCounts.get(key) || 1,
      memoryUsage: this.getMemoryUsage(),
      errorCount: 0, // Will be updated by error boundaries
      userInteractionLatency: 0, // Will be updated by interaction tracking
      timestamp: new Date().toISOString(),
      isModern
    };

    // Store metrics
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    this.metrics.get(key)!.push(metrics);

    // Clean up
    this.renderStartTimes.delete(key);

    return metrics;
  }

  // Get memory usage (approximation)
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  // Record user interaction latency
  recordInteractionLatency(componentName: string, isModern: boolean, latency: number): void {
    const key = `${componentName}-${isModern ? 'modern' : 'legacy'}`;
    const metricsArray = this.metrics.get(key);
    if (metricsArray && metricsArray.length > 0) {
      const lastMetrics = metricsArray[metricsArray.length - 1];
      lastMetrics.userInteractionLatency = latency;
    }
  }

  // Record error
  recordError(componentName: string, isModern: boolean): void {
    const key = `${componentName}-${isModern ? 'modern' : 'legacy'}`;
    const metricsArray = this.metrics.get(key);
    if (metricsArray && metricsArray.length > 0) {
      const lastMetrics = metricsArray[metricsArray.length - 1];
      lastMetrics.errorCount += 1;
    }
  }

  // Get average metrics for a component
  getAverageMetrics(componentName: string, isModern: boolean): ComponentMetrics | null {
    const key = `${componentName}-${isModern ? 'modern' : 'legacy'}`;
    const metricsArray = this.metrics.get(key);
    
    if (!metricsArray || metricsArray.length === 0) {
      return null;
    }

    const avgMetrics: ComponentMetrics = {
      componentName,
      renderTime: metricsArray.reduce((sum, m) => sum + m.renderTime, 0) / metricsArray.length,
      rerenderCount: metricsArray.reduce((sum, m) => sum + m.rerenderCount, 0) / metricsArray.length,
      memoryUsage: metricsArray.reduce((sum, m) => sum + m.memoryUsage, 0) / metricsArray.length,
      errorCount: metricsArray.reduce((sum, m) => sum + m.errorCount, 0),
      userInteractionLatency: metricsArray.reduce((sum, m) => sum + m.userInteractionLatency, 0) / metricsArray.length,
      timestamp: new Date().toISOString(),
      isModern
    };

    return avgMetrics;
  }

  // Compare modern vs legacy performance
  comparePerformance(componentName: string): PerformanceComparison | null {
    const legacyMetrics = this.getAverageMetrics(componentName, false);
    const modernMetrics = this.getAverageMetrics(componentName, true);

    if (!legacyMetrics || !modernMetrics) {
      return null;
    }

    const renderTimeImprovement = ((legacyMetrics.renderTime - modernMetrics.renderTime) / legacyMetrics.renderTime * 100).toFixed(1);
    const memoryReduction = ((legacyMetrics.memoryUsage - modernMetrics.memoryUsage) / legacyMetrics.memoryUsage * 100).toFixed(1);
    const errorReduction = ((legacyMetrics.errorCount - modernMetrics.errorCount) / Math.max(legacyMetrics.errorCount, 1) * 100).toFixed(1);

    // Calculate overall performance score
    const renderImprove = parseFloat(renderTimeImprovement);
    const memoryImprove = parseFloat(memoryReduction);
    const errorImprove = parseFloat(errorReduction);
    
    let overallScore: 'significant' | 'moderate' | 'minimal' | 'regression';
    const avgImprovement = (renderImprove + memoryImprove + errorImprove) / 3;
    
    if (avgImprovement >= 20) overallScore = 'significant';
    else if (avgImprovement >= 10) overallScore = 'moderate';
    else if (avgImprovement >= 0) overallScore = 'minimal';
    else overallScore = 'regression';

    return {
      componentName,
      legacy: legacyMetrics,
      modern: modernMetrics,
      improvement: {
        renderTimeImprovement: `${renderTimeImprovement}%`,
        memoryReduction: `${memoryReduction}%`,
        errorReduction: `${errorReduction}%`,
        overallScore
      }
    };
  }

  // Get all performance data for reporting
  getAllMetrics(): Record<string, ComponentMetrics[]> {
    const result: Record<string, ComponentMetrics[]> = {};
    this.metrics.forEach((metrics, key) => {
      result[key] = metrics;
    });
    return result;
  }

  // Clear metrics (for testing)
  clearMetrics(): void {
    this.metrics.clear();
    this.renderStartTimes.clear();
    this.rerenderCounts.clear();
  }
}

// Global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// React hook for performance monitoring
export function usePerformanceMonitoring(componentName: string, isModern: boolean) {
  const startTimeRef = React.useRef<number>(0);

  React.useEffect(() => {
    // Start measurement on mount
    performanceMonitor.startMeasurement(componentName, isModern);
    startTimeRef.current = performance.now();

    return () => {
      // End measurement on unmount
      performanceMonitor.endMeasurement(componentName, isModern);
    };
  }, [componentName, isModern]);

  React.useEffect(() => {
    // Record render time on each render
    if (startTimeRef.current > 0) {
      performanceMonitor.endMeasurement(componentName, isModern);
      performanceMonitor.startMeasurement(componentName, isModern);
      startTimeRef.current = performance.now();
    }
  });

  // Return utility functions for interaction tracking
  return {
    recordInteraction: (latency: number) => {
      performanceMonitor.recordInteractionLatency(componentName, isModern, latency);
    },
    recordError: () => {
      performanceMonitor.recordError(componentName, isModern);
    }
  };
}

// Production performance monitoring configuration
export const PRODUCTION_MONITORING_CONFIG = {
  enabledInProduction: true,
  sampleRate: 0.1, // Monitor 10% of users
  performanceThresholds: {
    renderTimeWarning: 50, // ms
    renderTimeError: 100, // ms
    memoryWarning: 50 * 1024 * 1024, // 50MB
    memoryError: 100 * 1024 * 1024, // 100MB
    errorRateWarning: 0.01, // 1%
    errorRateError: 0.05 // 5%
  },
  autoRollbackThresholds: {
    renderTimeRegression: 1.5, // 50% slower
    memoryRegression: 1.3, // 30% more memory
    errorRateIncrease: 2.0 // 100% more errors
  }
};

// Performance reporting utility
export class PerformanceReporter {
  static generateReport(componentName: string): PerformanceComparison | null {
    return performanceMonitor.comparePerformance(componentName);
  }

  static generateFullReport(): Record<string, PerformanceComparison> {
    const allMetrics = performanceMonitor.getAllMetrics();
    const componentNames = new Set<string>();
    
    Object.keys(allMetrics).forEach(key => {
      const componentName = key.split('-')[0];
      componentNames.add(componentName);
    });

    const report: Record<string, PerformanceComparison> = {};
    componentNames.forEach(componentName => {
      const comparison = performanceMonitor.comparePerformance(componentName);
      if (comparison) {
        report[componentName] = comparison;
      }
    });

    return report;
  }

  static shouldRollback(componentName: string): boolean {
    const comparison = performanceMonitor.comparePerformance(componentName);
    if (!comparison) return false;

    const { legacy, modern } = comparison;
    const config = PRODUCTION_MONITORING_CONFIG.autoRollbackThresholds;

    // Check for significant regressions
    const renderRegression = modern.renderTime / legacy.renderTime;
    const memoryRegression = modern.memoryUsage / legacy.memoryUsage;
    const errorRegression = modern.errorCount / Math.max(legacy.errorCount, 1);

    return (
      renderRegression > config.renderTimeRegression ||
      memoryRegression > config.memoryRegression ||
      errorRegression > config.errorRateIncrease
    );
  }
}

// Development-only performance debugging
export function debugPerformance(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const comparison = performanceMonitor.comparePerformance(componentName);
    if (comparison) {
      console.group(`🔍 Performance Analysis: ${componentName}`);
      console.log('📊 Legacy Metrics:', comparison.legacy);
      console.log('⚡ Modern Metrics:', comparison.modern);
      console.log('📈 Improvements:', comparison.improvement);
      console.log(`🎯 Overall Score: ${comparison.improvement.overallScore}`);
      console.groupEnd();
    }
  }
}