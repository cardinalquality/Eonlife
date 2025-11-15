/**
 * Google Analytics 4 Tracking Utilities
 * Comprehensive analytics tracking for e-commerce, events, and conversions
 */

// Extend Window interface to include gtag
declare global {
  interface Window {
    gtag?: (
      command: string,
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Initialize Google Analytics
 */
export const initGA = (measurementId: string) => {
  if (typeof window !== 'undefined') {
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer?.push(args);
    }
    gtag('js', new Date());
    gtag('config', measurementId, {
      page_path: window.location.pathname,
    });
  }
};

/**
 * Track custom events
 */
export const trackEvent = (eventName: string, params: Record<string, any> = {}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track page views
 */
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_ID as string, {
      page_path: url,
    });
  }
};

// E-commerce Tracking Interfaces
interface ProductItem {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_brand?: string;
  item_category?: string;
  item_variant?: string;
}

interface Order {
  id: string;
  total: number;
  tax?: number;
  shippingCost?: number;
  items: ProductItem[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  brand?: string;
  category?: string;
  variant?: string;
}

interface Cart {
  total: number;
  items: ProductItem[];
}

/**
 * E-commerce Tracking Functions
 */

// Track product view
export const trackViewItem = (product: Product) => {
  trackEvent('view_item', {
    currency: 'USD',
    value: product.price,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_brand: product.brand,
      item_category: product.category,
      item_variant: product.variant,
      quantity: 1,
    }],
  });
};

// Track add to cart
export const trackAddToCart = (product: Product, quantity: number = 1) => {
  trackEvent('add_to_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      item_brand: product.brand,
      item_category: product.category,
      item_variant: product.variant,
      quantity: quantity,
    }],
  });
};

// Track remove from cart
export const trackRemoveFromCart = (product: Product, quantity: number = 1) => {
  trackEvent('remove_from_cart', {
    currency: 'USD',
    value: product.price * quantity,
    items: [{
      item_id: product.id,
      item_name: product.name,
      price: product.price,
      quantity: quantity,
    }],
  });
};

// Track begin checkout
export const trackBeginCheckout = (cart: Cart) => {
  trackEvent('begin_checkout', {
    currency: 'USD',
    value: cart.total,
    items: cart.items,
  });
};

// Track purchase/conversion
export const trackPurchase = (order: Order) => {
  trackEvent('purchase', {
    transaction_id: order.id,
    value: order.total,
    currency: 'USD',
    tax: order.tax || 0,
    shipping: order.shippingCost || 0,
    items: order.items,
  });
};

/**
 * Lead Generation & Conversion Tracking
 */

// Track newsletter signup
export const trackNewsletterSignup = (method: string = 'website_form') => {
  trackEvent('newsletter_signup', {
    method: method,
    event_category: 'engagement',
    event_label: 'Newsletter Subscription',
  });
};

// Track form submission
export const trackFormSubmit = (formName: string, formData?: Record<string, any>) => {
  trackEvent('form_submit', {
    form_name: formName,
    event_category: 'engagement',
    ...formData,
  });
};

// Track CTA clicks
export const trackCTAClick = (ctaName: string, ctaLocation: string) => {
  trackEvent('cta_click', {
    cta_name: ctaName,
    cta_location: ctaLocation,
    event_category: 'engagement',
  });
};

// Track button clicks
export const trackButtonClick = (buttonName: string, buttonLocation: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: buttonLocation,
    event_category: 'engagement',
  });
};

/**
 * User Engagement Tracking
 */

// Track scroll depth
export const trackScrollDepth = (depth: number) => {
  trackEvent('scroll_depth', {
    scroll_depth: depth,
    event_category: 'engagement',
  });
};

// Track video play
export const trackVideoPlay = (videoName: string) => {
  trackEvent('video_play', {
    video_name: videoName,
    event_category: 'engagement',
  });
};

// Track link clicks (external)
export const trackOutboundLink = (url: string, linkText?: string) => {
  trackEvent('outbound_link_click', {
    link_url: url,
    link_text: linkText,
    event_category: 'engagement',
  });
};

/**
 * Error & Performance Tracking
 */

// Track errors
export const trackError = (errorMessage: string, errorType?: string) => {
  trackEvent('error', {
    error_message: errorMessage,
    error_type: errorType || 'general',
    event_category: 'error',
  });
};

// Track search
export const trackSearch = (searchTerm: string) => {
  trackEvent('search', {
    search_term: searchTerm,
    event_category: 'engagement',
  });
};

/**
 * Social Media Tracking
 */

// Track social share
export const trackSocialShare = (platform: string, contentType: string) => {
  trackEvent('share', {
    method: platform,
    content_type: contentType,
    event_category: 'social',
  });
};

/**
 * Custom Business Events
 */

// Track product interest
export const trackProductInterest = (productName: string, action: string) => {
  trackEvent('product_interest', {
    product_name: productName,
    action: action, // e.g., 'view_details', 'watch_video', 'read_reviews'
    event_category: 'product_engagement',
  });
};

// Track testimonial interaction
export const trackTestimonialView = (testimonialId: string) => {
  trackEvent('testimonial_view', {
    testimonial_id: testimonialId,
    event_category: 'social_proof',
  });
};

// Track FAQ interaction
export const trackFAQClick = (question: string) => {
  trackEvent('faq_click', {
    question: question,
    event_category: 'support',
  });
};

/**
 * UTM Parameter Tracking
 * These are automatically tracked by GA4, but you can use this helper to parse them
 */
export const getUTMParams = () => {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
  };
};

/**
 * User Properties
 */
export const setUserProperties = (properties: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

/**
 * Timing Events
 */
export const trackTiming = (
  name: string,
  value: number,
  category?: string,
  label?: string
) => {
  trackEvent('timing_complete', {
    name: name,
    value: value,
    event_category: category || 'timing',
    event_label: label,
  });
};
