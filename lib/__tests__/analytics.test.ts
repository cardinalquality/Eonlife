/**
 * Unit tests for Google Analytics Tracking
 * Tests analytics initialization, event tracking, and e-commerce tracking
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  initGA,
  trackEvent,
  trackPageView,
  trackViewItem,
  trackAddToCart,
  trackRemoveFromCart,
  trackBeginCheckout,
  trackPurchase,
  trackNewsletterSignup,
  trackFormSubmit,
  trackCTAClick,
  trackButtonClick,
  trackScrollDepth,
  trackVideoPlay,
  trackOutboundLink,
  trackError,
  trackSearch,
  trackSocialShare,
  trackProductInterest,
  trackTestimonialView,
  trackFAQClick,
  getUTMParams,
  setUserProperties,
  trackTiming
} from '../analytics';

describe('Analytics Tracking', () => {
  let mockGtag: ReturnType<typeof vi.fn>;
  let mockWindow: any;

  beforeEach(() => {
    mockGtag = vi.fn();
    mockWindow = {
      gtag: mockGtag,
      dataLayer: [],
      location: {
        pathname: '/test-page',
        search: '?utm_source=test&utm_medium=email'
      }
    };

    // Mock window object
    global.window = mockWindow as any;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('initGA', () => {
    it('should initialize Google Analytics', () => {
      const measurementId = 'G-XXXXXXXXXX';

      initGA(measurementId);

      expect(window.dataLayer).toBeDefined();
      expect(window.dataLayer?.length).toBeGreaterThan(0);
    });

    it('should set page path to current location', () => {
      const measurementId = 'G-XXXXXXXXXX';

      initGA(measurementId);

      // Check that gtag was called with config
      const configCall = window.dataLayer?.find(
        (item: any) => Array.isArray(item) && item[0] === 'config'
      );
      expect(configCall).toBeDefined();
    });

    it('should initialize dataLayer if not exists', () => {
      delete window.dataLayer;

      initGA('G-XXXXXXXXXX');

      expect(window.dataLayer).toBeDefined();
      expect(Array.isArray(window.dataLayer)).toBe(true);
    });

    it('should not error in non-browser environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => initGA('G-XXXXXXXXXX')).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('trackEvent', () => {
    it('should track custom event', () => {
      trackEvent('test_event', { param1: 'value1' });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        param1: 'value1'
      });
    });

    it('should track event without params', () => {
      trackEvent('simple_event');

      expect(mockGtag).toHaveBeenCalledWith('event', 'simple_event', {});
    });

    it('should handle multiple parameters', () => {
      trackEvent('complex_event', {
        param1: 'value1',
        param2: 123,
        param3: true
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'complex_event', {
        param1: 'value1',
        param2: 123,
        param3: true
      });
    });

    it('should not error when gtag is undefined', () => {
      delete window.gtag;

      expect(() => trackEvent('test_event')).not.toThrow();
      expect(mockGtag).not.toHaveBeenCalled();
    });

    it('should not error in non-browser environment', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => trackEvent('test_event')).not.toThrow();

      global.window = originalWindow;
    });
  });

  describe('trackPageView', () => {
    it('should track page view', () => {
      process.env.NEXT_PUBLIC_GA_ID = 'G-XXXXXXXXXX';

      trackPageView('/about');

      expect(mockGtag).toHaveBeenCalledWith('config', 'G-XXXXXXXXXX', {
        page_path: '/about'
      });
    });

    it('should not error when GA ID is not set', () => {
      delete process.env.NEXT_PUBLIC_GA_ID;

      expect(() => trackPageView('/about')).not.toThrow();
    });
  });

  describe('E-commerce Tracking', () => {
    const mockProduct = {
      id: 'prod_123',
      name: 'Test Product',
      price: 29.99,
      brand: 'Test Brand',
      category: 'Electronics',
      variant: 'Blue'
    };

    describe('trackViewItem', () => {
      it('should track product view', () => {
        trackViewItem(mockProduct);

        expect(mockGtag).toHaveBeenCalledWith('event', 'view_item', {
          currency: 'USD',
          value: 29.99,
          items: [{
            item_id: 'prod_123',
            item_name: 'Test Product',
            price: 29.99,
            item_brand: 'Test Brand',
            item_category: 'Electronics',
            item_variant: 'Blue',
            quantity: 1
          }]
        });
      });

      it('should handle product without optional fields', () => {
        const minimalProduct = {
          id: 'prod_456',
          name: 'Minimal Product',
          price: 19.99
        };

        trackViewItem(minimalProduct);

        expect(mockGtag).toHaveBeenCalledWith('event', 'view_item', {
          currency: 'USD',
          value: 19.99,
          items: [{
            item_id: 'prod_456',
            item_name: 'Minimal Product',
            price: 19.99,
            item_brand: undefined,
            item_category: undefined,
            item_variant: undefined,
            quantity: 1
          }]
        });
      });
    });

    describe('trackAddToCart', () => {
      it('should track add to cart with default quantity', () => {
        trackAddToCart(mockProduct);

        expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', {
          currency: 'USD',
          value: 29.99,
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 1
            })
          ])
        });
      });

      it('should track add to cart with custom quantity', () => {
        trackAddToCart(mockProduct, 3);

        expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart', {
          currency: 'USD',
          value: 89.97, // 29.99 * 3
          items: expect.arrayContaining([
            expect.objectContaining({
              quantity: 3
            })
          ])
        });
      });

      it('should calculate value correctly', () => {
        trackAddToCart(mockProduct, 5);

        expect(mockGtag).toHaveBeenCalledWith('event', 'add_to_cart',
          expect.objectContaining({
            value: 149.95 // 29.99 * 5
          })
        );
      });
    });

    describe('trackRemoveFromCart', () => {
      it('should track remove from cart', () => {
        trackRemoveFromCart(mockProduct, 2);

        expect(mockGtag).toHaveBeenCalledWith('event', 'remove_from_cart', {
          currency: 'USD',
          value: 59.98,
          items: [{
            item_id: 'prod_123',
            item_name: 'Test Product',
            price: 29.99,
            quantity: 2
          }]
        });
      });

      it('should default to quantity 1', () => {
        trackRemoveFromCart(mockProduct);

        expect(mockGtag).toHaveBeenCalledWith('event', 'remove_from_cart',
          expect.objectContaining({
            items: expect.arrayContaining([
              expect.objectContaining({
                quantity: 1
              })
            ])
          })
        );
      });
    });

    describe('trackBeginCheckout', () => {
      it('should track begin checkout', () => {
        const cart = {
          total: 99.99,
          items: [
            {
              item_id: 'prod_1',
              item_name: 'Product 1',
              price: 49.99,
              quantity: 1
            },
            {
              item_id: 'prod_2',
              item_name: 'Product 2',
              price: 50.00,
              quantity: 1
            }
          ]
        };

        trackBeginCheckout(cart);

        expect(mockGtag).toHaveBeenCalledWith('event', 'begin_checkout', {
          currency: 'USD',
          value: 99.99,
          items: cart.items
        });
      });
    });

    describe('trackPurchase', () => {
      it('should track purchase', () => {
        const order = {
          id: 'order_123',
          total: 119.99,
          tax: 10.00,
          shippingCost: 5.00,
          items: [
            {
              item_id: 'prod_1',
              item_name: 'Product 1',
              price: 104.99,
              quantity: 1
            }
          ]
        };

        trackPurchase(order);

        expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
          transaction_id: 'order_123',
          value: 119.99,
          currency: 'USD',
          tax: 10.00,
          shipping: 5.00,
          items: order.items
        });
      });

      it('should handle order without tax and shipping', () => {
        const order = {
          id: 'order_456',
          total: 99.99,
          items: []
        };

        trackPurchase(order);

        expect(mockGtag).toHaveBeenCalledWith('event', 'purchase', {
          transaction_id: 'order_456',
          value: 99.99,
          currency: 'USD',
          tax: 0,
          shipping: 0,
          items: []
        });
      });
    });
  });

  describe('Lead Generation Tracking', () => {
    describe('trackNewsletterSignup', () => {
      it('should track newsletter signup with default method', () => {
        trackNewsletterSignup();

        expect(mockGtag).toHaveBeenCalledWith('event', 'newsletter_signup', {
          method: 'website_form',
          event_category: 'engagement',
          event_label: 'Newsletter Subscription'
        });
      });

      it('should track newsletter signup with custom method', () => {
        trackNewsletterSignup('popup');

        expect(mockGtag).toHaveBeenCalledWith('event', 'newsletter_signup', {
          method: 'popup',
          event_category: 'engagement',
          event_label: 'Newsletter Subscription'
        });
      });
    });

    describe('trackFormSubmit', () => {
      it('should track form submission', () => {
        trackFormSubmit('contact_form');

        expect(mockGtag).toHaveBeenCalledWith('event', 'form_submit', {
          form_name: 'contact_form',
          event_category: 'engagement'
        });
      });

      it('should include form data if provided', () => {
        trackFormSubmit('signup_form', { source: 'homepage' });

        expect(mockGtag).toHaveBeenCalledWith('event', 'form_submit', {
          form_name: 'signup_form',
          event_category: 'engagement',
          source: 'homepage'
        });
      });
    });

    describe('trackCTAClick', () => {
      it('should track CTA click', () => {
        trackCTAClick('Get Started', 'hero_section');

        expect(mockGtag).toHaveBeenCalledWith('event', 'cta_click', {
          cta_name: 'Get Started',
          cta_location: 'hero_section',
          event_category: 'engagement'
        });
      });
    });

    describe('trackButtonClick', () => {
      it('should track button click', () => {
        trackButtonClick('Download', 'sidebar');

        expect(mockGtag).toHaveBeenCalledWith('event', 'button_click', {
          button_name: 'Download',
          button_location: 'sidebar',
          event_category: 'engagement'
        });
      });
    });
  });

  describe('User Engagement Tracking', () => {
    describe('trackScrollDepth', () => {
      it('should track scroll depth', () => {
        trackScrollDepth(75);

        expect(mockGtag).toHaveBeenCalledWith('event', 'scroll_depth', {
          scroll_depth: 75,
          event_category: 'engagement'
        });
      });
    });

    describe('trackVideoPlay', () => {
      it('should track video play', () => {
        trackVideoPlay('Product Demo');

        expect(mockGtag).toHaveBeenCalledWith('event', 'video_play', {
          video_name: 'Product Demo',
          event_category: 'engagement'
        });
      });
    });

    describe('trackOutboundLink', () => {
      it('should track outbound link click', () => {
        trackOutboundLink('https://external.com', 'Learn More');

        expect(mockGtag).toHaveBeenCalledWith('event', 'outbound_link_click', {
          link_url: 'https://external.com',
          link_text: 'Learn More',
          event_category: 'engagement'
        });
      });

      it('should track outbound link without text', () => {
        trackOutboundLink('https://external.com');

        expect(mockGtag).toHaveBeenCalledWith('event', 'outbound_link_click', {
          link_url: 'https://external.com',
          link_text: undefined,
          event_category: 'engagement'
        });
      });
    });
  });

  describe('Error & Performance Tracking', () => {
    describe('trackError', () => {
      it('should track error with default type', () => {
        trackError('API request failed');

        expect(mockGtag).toHaveBeenCalledWith('event', 'error', {
          error_message: 'API request failed',
          error_type: 'general',
          event_category: 'error'
        });
      });

      it('should track error with custom type', () => {
        trackError('Network timeout', 'network');

        expect(mockGtag).toHaveBeenCalledWith('event', 'error', {
          error_message: 'Network timeout',
          error_type: 'network',
          event_category: 'error'
        });
      });
    });

    describe('trackSearch', () => {
      it('should track search', () => {
        trackSearch('laptop');

        expect(mockGtag).toHaveBeenCalledWith('event', 'search', {
          search_term: 'laptop',
          event_category: 'engagement'
        });
      });
    });
  });

  describe('Social Media Tracking', () => {
    describe('trackSocialShare', () => {
      it('should track social share', () => {
        trackSocialShare('twitter', 'blog_post');

        expect(mockGtag).toHaveBeenCalledWith('event', 'share', {
          method: 'twitter',
          content_type: 'blog_post',
          event_category: 'social'
        });
      });
    });
  });

  describe('Custom Business Events', () => {
    describe('trackProductInterest', () => {
      it('should track product interest', () => {
        trackProductInterest('Premium Plan', 'view_details');

        expect(mockGtag).toHaveBeenCalledWith('event', 'product_interest', {
          product_name: 'Premium Plan',
          action: 'view_details',
          event_category: 'product_engagement'
        });
      });
    });

    describe('trackTestimonialView', () => {
      it('should track testimonial view', () => {
        trackTestimonialView('testimonial_123');

        expect(mockGtag).toHaveBeenCalledWith('event', 'testimonial_view', {
          testimonial_id: 'testimonial_123',
          event_category: 'social_proof'
        });
      });
    });

    describe('trackFAQClick', () => {
      it('should track FAQ click', () => {
        trackFAQClick('How do I cancel?');

        expect(mockGtag).toHaveBeenCalledWith('event', 'faq_click', {
          question: 'How do I cancel?',
          event_category: 'support'
        });
      });
    });
  });

  describe('UTM Parameter Tracking', () => {
    describe('getUTMParams', () => {
      it('should extract UTM parameters from URL', () => {
        window.location.search = '?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale';

        const params = getUTMParams();

        expect(params).toEqual({
          utm_source: 'google',
          utm_medium: 'cpc',
          utm_campaign: 'summer_sale',
          utm_term: null,
          utm_content: null
        });
      });

      it('should handle missing UTM parameters', () => {
        window.location.search = '?other_param=value';

        const params = getUTMParams();

        expect(params).toEqual({
          utm_source: null,
          utm_medium: null,
          utm_campaign: null,
          utm_term: null,
          utm_content: null
        });
      });

      it('should return empty object in non-browser environment', () => {
        const originalWindow = global.window;
        // @ts-ignore
        delete global.window;

        const params = getUTMParams();

        expect(params).toEqual({});

        global.window = originalWindow;
      });

      it('should extract all UTM parameters', () => {
        window.location.search = '?utm_source=email&utm_medium=newsletter&utm_campaign=launch&utm_term=keyword&utm_content=link1';

        const params = getUTMParams();

        expect(params).toEqual({
          utm_source: 'email',
          utm_medium: 'newsletter',
          utm_campaign: 'launch',
          utm_term: 'keyword',
          utm_content: 'link1'
        });
      });
    });
  });

  describe('setUserProperties', () => {
    it('should set user properties', () => {
      setUserProperties({ user_type: 'premium', age_range: '25-34' });

      expect(mockGtag).toHaveBeenCalledWith('set', 'user_properties', {
        user_type: 'premium',
        age_range: '25-34'
      });
    });

    it('should not error when gtag is undefined', () => {
      delete window.gtag;

      expect(() => setUserProperties({ user_type: 'free' })).not.toThrow();
    });
  });

  describe('trackTiming', () => {
    it('should track timing event with all parameters', () => {
      trackTiming('page_load', 1500, 'performance', 'homepage');

      expect(mockGtag).toHaveBeenCalledWith('event', 'timing_complete', {
        name: 'page_load',
        value: 1500,
        event_category: 'performance',
        event_label: 'homepage'
      });
    });

    it('should track timing with default category', () => {
      trackTiming('api_call', 250);

      expect(mockGtag).toHaveBeenCalledWith('event', 'timing_complete', {
        name: 'api_call',
        value: 250,
        event_category: 'timing',
        event_label: undefined
      });
    });

    it('should track timing without label', () => {
      trackTiming('database_query', 100, 'backend');

      expect(mockGtag).toHaveBeenCalledWith('event', 'timing_complete', {
        name: 'database_query',
        value: 100,
        event_category: 'backend',
        event_label: undefined
      });
    });
  });
});
