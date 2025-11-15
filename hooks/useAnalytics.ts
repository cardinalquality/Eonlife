import { useCallback } from 'react';
import {
  trackEvent,
  trackCTAClick,
  trackButtonClick,
  trackNewsletterSignup,
  trackFormSubmit,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackProductInterest,
  trackScrollDepth,
  trackOutboundLink,
} from '@/lib/analytics';

/**
 * Custom hook for easy analytics tracking in components
 * Provides memoized tracking functions to prevent unnecessary re-renders
 */
export function useAnalytics() {
  const handleCTAClick = useCallback((ctaName: string, ctaLocation: string) => {
    trackCTAClick(ctaName, ctaLocation);
  }, []);

  const handleButtonClick = useCallback((buttonName: string, buttonLocation: string) => {
    trackButtonClick(buttonName, buttonLocation);
  }, []);

  const handleNewsletterSignup = useCallback((method?: string) => {
    trackNewsletterSignup(method);
  }, []);

  const handleFormSubmit = useCallback((formName: string, formData?: Record<string, any>) => {
    trackFormSubmit(formName, formData);
  }, []);

  const handleAddToCart = useCallback((product: any, quantity?: number) => {
    trackAddToCart(product, quantity);
  }, []);

  const handleBeginCheckout = useCallback((cart: any) => {
    trackBeginCheckout(cart);
  }, []);

  const handlePurchase = useCallback((order: any) => {
    trackPurchase(order);
  }, []);

  const handleProductInterest = useCallback((productName: string, action: string) => {
    trackProductInterest(productName, action);
  }, []);

  const handleScrollDepth = useCallback((depth: number) => {
    trackScrollDepth(depth);
  }, []);

  const handleOutboundLink = useCallback((url: string, linkText?: string) => {
    trackOutboundLink(url, linkText);
  }, []);

  const handleCustomEvent = useCallback((eventName: string, params?: Record<string, any>) => {
    trackEvent(eventName, params);
  }, []);

  return {
    trackCTAClick: handleCTAClick,
    trackButtonClick: handleButtonClick,
    trackNewsletterSignup: handleNewsletterSignup,
    trackFormSubmit: handleFormSubmit,
    trackAddToCart: handleAddToCart,
    trackBeginCheckout: handleBeginCheckout,
    trackPurchase: handlePurchase,
    trackProductInterest: handleProductInterest,
    trackScrollDepth: handleScrollDepth,
    trackOutboundLink: handleOutboundLink,
    trackEvent: handleCustomEvent,
  };
}
