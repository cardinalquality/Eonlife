import { VariantConfig } from '@/lib/types/product';

export const matureEleganceVariant: VariantConfig = {
  id: 'mature-elegance',
  name: 'Mature Elegance',
  description: 'Sophisticated landing page targeting mature demographic with elegant design',

  assets: {
    logo: '/products/reluma/logo.png',
    heroBackground: {
      desktop: '/products/reluma/assets/mature-elegance/desktop/Section_1_assets/Section_1_1920x900.png',
      mobile: '/products/reluma/assets/mature-elegance/mobile/Section_1_assets/375x397_Bg_pic_1.png',
    },
    sections: {
      // Add section assets when Option 2 assets are ready
    },
  },

  content: {
    hero: {
      headline: 'Timeless Beauty, Scientific Excellence',
      subheadline: 'Advanced skin rejuvenation powered by 387 growth factors',
      formTitle: 'Begin Your Journey',
      ctaText: 'Shop Now',
      description: 'Experience the transformation',
    },
    section2: {
      title: 'The Science of ReLuma',
      description: 'Discover how our proprietary blend of 387 growth factors works to restore your skin\'s youthful vitality and radiance.',
      ctaText: 'Explore the Science',
    },
    section3: {
      title: 'Proven Benefits',
      features: [
        {
          title: 'Reduces Fine Lines',
          description: 'Diminish the appearance of wrinkles and fine lines',
        },
        {
          title: 'Improves Firmness',
          description: 'Restore skin elasticity and firmness',
        },
        {
          title: 'Brightens Complexion',
          description: 'Achieve a more radiant, even skin tone',
        },
        {
          title: 'Deep Hydration',
          description: 'Nourish skin with lasting moisture',
        },
      ],
    },
    footer: {
      socialLinks: [
        {
          platform: 'Facebook',
          url: 'https://facebook.com/reluma',
          icon: '/products/reluma/icons/023-facebook.svg',
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com/reluma',
          icon: '/products/reluma/icons/044-instagram.svg',
        },
        {
          platform: 'LinkedIn',
          url: 'https://linkedin.com/company/reluma',
          icon: '/products/reluma/icons/052-linkedin.svg',
        },
      ],
      links: [
        { label: 'Privacy Policy', url: '/privacy' },
        { label: 'Terms of Service', url: '/terms' },
        { label: 'Contact Us', url: '/contact' },
      ],
      copyrightText: '© 2024 ReLuma. All rights reserved.',
    },
  },
};
