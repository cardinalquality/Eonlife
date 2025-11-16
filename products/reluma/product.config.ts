import { ProductConfig } from '@/lib/types/product';
import { youthfulRadianceVariant } from './variants/youthful-radiance.config';
import { matureEleganceVariant } from './variants/mature-elegance.config';

export const relumaProduct: ProductConfig = {
  id: 'reluma',
  name: 'ReLuma',

  metadata: {
    title: 'ReLuma - Discover Radiant, Youthful Skin',
    description: 'Powered by 387 Human Growth Factors for comprehensive skin rejuvenation',
    keywords: ['skincare', 'anti-aging', 'growth factors', 'skin rejuvenation', 'cosmetics'],
    ogImage: '/products/reluma/og-image.png',
  },

  branding: {
    logo: '/products/reluma/logo.png',
    primaryColor: '#8B7355', // Warm brown/beige from branding
    secondaryColor: '#F5F1ED', // Light cream background
    accentColor: '#D4A574', // Gold accent
    backgroundColor: '#FFFFFF',
    textColor: '#2C2C2C',
    fontFamily: 'var(--font-avenir)',
  },

  sections: [
    'hero-with-form',
    'education',
    'features',
    'testimonials',
    'science',
    'before-after',
    'footer',
  ],

  providers: {
    form: 'none', // Can be configured per deployment
    analytics: 'none',
    payment: 'none',
    email: 'none',
  },

  variants: {
    'youthful-radiance': youthfulRadianceVariant,
    'mature-elegance': matureEleganceVariant,
  },
};
