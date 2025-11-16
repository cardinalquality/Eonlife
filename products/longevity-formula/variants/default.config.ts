import { VariantConfig } from '@/lib/types/product';

export const defaultVariant: VariantConfig = {
  id: 'default',
  name: 'Default',
  description: 'Standard longevity formula landing page',

  assets: {
    logo: '/products/longevity-formula/logo.png',
    heroBackground: {
      desktop: '/products/longevity-formula/assets/hero-bg.jpg',
      mobile: '/products/longevity-formula/assets/hero-bg-mobile.jpg',
    },
  },

  content: {
    hero: {
      headline: 'Extend Your Healthspan',
      subheadline: 'Science-backed longevity formula for a longer, healthier life',
      formTitle: 'Start Your Journey',
      ctaText: 'Order Now',
      description: 'Join thousands living longer, healthier lives',
    },
    section2: {
      title: 'What is Longevity Formula?',
      description: 'Our proprietary blend combines cutting-edge longevity research with time-tested natural ingredients. Each capsule contains powerful compounds shown to support cellular health, mitochondrial function, and healthy aging.',
      ctaText: 'Learn More',
    },
    section3: {
      title: 'Key Benefits',
      features: [
        {
          title: 'Cellular Health',
          description: 'Support healthy cellular function and renewal',
        },
        {
          title: 'Energy & Vitality',
          description: 'Boost mitochondrial energy production',
        },
        {
          title: 'Cognitive Function',
          description: 'Enhance mental clarity and focus',
        },
        {
          title: 'Longevity Support',
          description: 'Activate longevity pathways at the cellular level',
        },
      ],
    },
    section5: {
      title: 'Customer Success Stories',
      testimonials: [
        {
          name: 'Dr. Sarah Mitchell',
          quote: 'As a physician, I\'m impressed by the research-backed ingredients. I feel more energetic and focused.',
          rating: 5,
        },
        {
          name: 'James Thompson',
          quote: 'After 3 months, my biomarkers improved significantly. This is the real deal.',
          rating: 5,
        },
        {
          name: 'Linda Chen',
          quote: 'I\'ve never felt better at 55. My friends keep asking what my secret is!',
          rating: 5,
        },
      ],
    },
    section7: {
      title: 'The Science of Longevity',
      content: 'Our formula targets key longevity pathways including NAD+ production, sirtuin activation, and mTOR regulation. Each ingredient is selected based on peer-reviewed research and clinical studies demonstrating benefits for healthspan extension.',
      ctaText: 'Read the Research',
    },
    footer: {
      socialLinks: [
        {
          platform: 'Facebook',
          url: 'https://facebook.com',
          icon: '/products/reluma/icons/023-facebook.svg',
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com',
          icon: '/products/reluma/icons/044-instagram.svg',
        },
      ],
      links: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' },
        { label: 'Contact Us', url: '/contact' },
      ],
      copyrightText: '© 2024 Longevity Formula. All rights reserved.',
    },
  },
};
