// Product configuration types for universal landing page system

export interface ProductMetadata {
  title: string;
  description: string;
  keywords?: string[];
  ogImage?: string;
  favicon?: string;
}

export interface ProductBranding {
  logo: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
}

export interface ProductProviders {
  form?: 'formspree' | 'sendgrid' | 'custom' | 'none';
  analytics?: 'google-analytics' | 'plausible' | 'mixpanel' | 'none';
  payment?: 'stripe' | 'paypal' | 'square' | 'shopify' | 'none';
  email?: 'mailchimp' | 'convertkit' | 'sendgrid' | 'none';
}

export type SectionType =
  | 'header'
  | 'hero'
  | 'hero-with-form'
  | 'hero-video'
  | 'education'
  | 'features'
  | 'features-grid'
  | 'testimonials'
  | 'science'
  | 'before-after'
  | 'benefits'
  | 'ingredients'
  | 'faq'
  | 'pricing'
  | 'pricing-table'
  | 'cta'
  | 'footer';

export interface ProductConfig {
  id: string;
  name: string;
  metadata: ProductMetadata;
  branding: ProductBranding;
  sections: SectionType[];
  providers: ProductProviders;
  variants: {
    [variantId: string]: VariantConfig;
  };
}

// Re-export existing VariantConfig types
export interface VariantAssets {
  logo?: string;
  heroBackground?: {
    desktop: string;
    mobile: string;
  };
  sections?: {
    [key: string]: {
      desktop?: string;
      mobile?: string;
      images?: string[];
    };
  };
}

export interface VariantContent {
  hero?: {
    headline: string;
    subheadline: string;
    formTitle?: string;
    ctaText: string;
    ctaSecondary?: string;
    description?: string;
  };
  section2?: {
    title: string;
    description: string;
    ctaText?: string;
  };
  section3?: {
    title: string;
    features?: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  section4?: {
    title: string;
    description: string;
    image?: string;
  };
  section5?: {
    title: string;
    testimonials?: Array<{
      name: string;
      quote: string;
      rating?: number;
      image?: string;
    }>;
  };
  section6?: {
    ctaText: string;
    ctaSubtext?: string;
  };
  section7?: {
    title: string;
    content: string;
    ctaText?: string;
  };
  section8?: {
    title: string;
    beforeImage?: string;
    afterImage?: string;
    description: string;
  };
  section9?: {
    title: string;
    content: string;
  };
  section10?: {
    title: string;
    description: string;
    ctaText?: string;
  };
  footer?: {
    socialLinks?: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
    links?: Array<{
      label: string;
      url: string;
    }>;
    copyrightText: string;
  };
}

export interface VariantConfig {
  id: string;
  name: string;
  description: string;
  assets: VariantAssets;
  content: VariantContent;
}
