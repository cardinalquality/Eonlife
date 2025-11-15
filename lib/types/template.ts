// Template configuration types for easy variant switching

export interface TemplateAssets {
  logo: string;
  heroBackground: {
    desktop: string;
    mobile: string;
  };
  sections: {
    [key: string]: {
      desktop?: string;
      mobile?: string;
      images?: string[];
    };
  };
}

export interface TemplateContent {
  hero: {
    headline: string;
    subheadline: string;
    formTitle: string;
    ctaText: string;
  };
  section2: {
    title: string;
    description: string;
    ctaText: string;
  };
  section3: {
    title: string;
    features: Array<{
      title: string;
      description: string;
      icon?: string;
    }>;
  };
  section4: {
    title: string;
    description: string;
    image: string;
  };
  section5: {
    title: string;
    testimonials: Array<{
      name: string;
      quote: string;
      rating?: number;
    }>;
  };
  section6: {
    ctaText: string;
    ctaSubtext: string;
  };
  section7: {
    title: string;
    content: string;
    ctaText: string;
  };
  section8: {
    title: string;
    beforeImage: string;
    afterImage: string;
    description: string;
  };
  section9: {
    title: string;
    content: string;
  };
  section10: {
    title: string;
    description: string;
    ctaText: string;
  };
  footer: {
    socialLinks: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
    links: Array<{
      label: string;
      url: string;
    }>;
    copyrightText: string;
  };
}

export interface TemplateConfig {
  name: string;
  description: string;
  assets: TemplateAssets;
  content: TemplateContent;
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
  };
}

export type TemplateVariant = 'option1' | 'option2';
