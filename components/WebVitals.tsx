'use client';

import { useEffect } from 'react';
import type { Metric } from 'web-vitals';

// Web Vitals tracking component
// Tracks Core Web Vitals: LCP, FID, CLS, FCP, TTFB, INP
export function WebVitals() {
  useEffect(() => {
    // Dynamically import web-vitals to reduce initial bundle size
    import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB, onINP }) => {
      // Report all web vitals
      onCLS(sendToAnalytics);
      onFCP(sendToAnalytics);
      onFID(sendToAnalytics);
      onLCP(sendToAnalytics);
      onTTFB(sendToAnalytics);
      onINP(sendToAnalytics);
    });
  }, []);

  return null;
}

// Send metrics to analytics service
function sendToAnalytics(metric: Metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vitals:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }

  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }

  // Send to custom analytics endpoint
  // Uncomment and configure this if you have a custom analytics endpoint
  /*
  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
    rating: metric.rating,
    delta: metric.delta,
    id: metric.id,
    navigationType: metric.navigationType,
  });

  const url = '/api/analytics';

  // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
  if (navigator.sendBeacon) {
    navigator.sendBeacon(url, body);
  } else {
    fetch(url, { body, method: 'POST', keepalive: true });
  }
  */
}

// Performance monitoring helper
export function logPerformanceMetrics() {
  if (typeof window === 'undefined') return;

  // Log navigation timing
  if (window.performance && window.performance.timing) {
    const timing = window.performance.timing;
    const metrics = {
      'DNS Lookup': timing.domainLookupEnd - timing.domainLookupStart,
      'TCP Connection': timing.connectEnd - timing.connectStart,
      'Request Time': timing.responseStart - timing.requestStart,
      'Response Time': timing.responseEnd - timing.responseStart,
      'DOM Processing': timing.domComplete - timing.domLoading,
      'Total Load Time': timing.loadEventEnd - timing.navigationStart,
    };

    console.table(metrics);
  }

  // Log resource timing
  if (window.performance && window.performance.getEntriesByType) {
    const resources = window.performance.getEntriesByType('resource');
    console.log('Resources loaded:', resources.length);

    // Group resources by type
    const resourcesByType = resources.reduce((acc: any, resource: any) => {
      const type = resource.initiatorType;
      if (!acc[type]) acc[type] = [];
      acc[type].push({
        name: resource.name.split('/').pop(),
        duration: Math.round(resource.duration),
        size: resource.transferSize,
      });
      return acc;
    }, {});

    console.table(resourcesByType);
  }
}
