import { ProductConfig } from '@/lib/types/product';
import { defaultVariant } from './variants/default.config';

export const longevityFormulaProduct: ProductConfig = {
  id: 'longevity-formula',
  name: 'Longevity Formula',

  metadata: {
    title: 'Longevity Formula - Science-Backed Healthspan Extension',
    description: 'Extend your healthspan with our research-backed longevity supplement. Cellular health, energy, and vitality.',
    keywords: ['longevity', 'healthspan', 'anti-aging', 'supplements', 'NAD+', 'cellular health'],
  },

  branding: {
    logo: '/products/longevity-formula/logo.png',
    primaryColor: '#2E7D32', // Deep green
    secondaryColor: '#E8F5E9', // Light green
    accentColor: '#66BB6A', // Medium green
    backgroundColor: '#FFFFFF',
    textColor: '#1B5E20',
    fontFamily: 'var(--font-avenir)',
  },

  sections: [
    'hero-with-form',
    'education',
    'features',
    'testimonials',
    'science',
    'footer',
  ],

  providers: {
    form: 'none',
    analytics: 'none',
    payment: 'none',
    email: 'none',
  },

  variants: {
    default: defaultVariant,
  },
};
