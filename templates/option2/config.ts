import { TemplateConfig } from '@/lib/types/template';

// TODO: This is a template for Option 2
// Copy assets from Option_2 folder and update paths below
// Then update lib/template-context.tsx to use this config

export const option2Config: TemplateConfig = {
  name: 'Option 2 - Mature Elegance',
  description: 'Landing page targeting mature demographic with sophisticated design',

  assets: {
    logo: '/assets/option2/logo.png',
    heroBackground: {
      desktop: '/assets/option2/desktop/Section_1_assets/Section_1_1920x900.png',
      mobile: '/assets/option2/mobile/Section_1_assets/375x397_Bg_pic_1.png',
    },
    sections: {
      section2: {
        desktop: '/assets/option2/desktop/Section_2_assets/Section_2_1920x600.png',
        mobile: '/assets/option2/mobile/Section_2_assets/Section_2_375x399.png',
        images: ['/assets/option2/desktop/Section_2_assets/Small_Bottles.png'],
      },
      section3: {
        desktop: '/assets/option2/desktop/Section_3_assets/Section_3_1920x700.png',
        mobile: '/assets/option2/mobile/Section_3_assets/Section_3_375x1062.png',
        images: ['/assets/option2/desktop/Section_3_assets/Small_Bottle.png'],
      },
      section4: {
        desktop: '/assets/option2/desktop/Section_4_assets/Section_4_1920x550.png',
        mobile: '/assets/option2/mobile/Section_4_assets/Section_4_375x1123.png',
        images: [
          '/assets/option2/desktop/Section_4_assets/Section_4_Older_Girl_Option2.png',
          '/assets/option2/desktop/Section_4_assets/Section_4_Bottles.png',
        ],
      },
      section5: {
        desktop: '/assets/option2/desktop/Section_5_assets/Section_5_1920x700.png',
        mobile: '/assets/option2/mobile/Section_5&6_assets/Section_5_BG.png',
      },
      section6: {
        desktop: '/assets/option2/desktop/Section_6_assets/Section_6_1920x150.png',
      },
      section7: {
        desktop: '/assets/option2/desktop/Section_7_assets/Section_7_1920x700.png',
        mobile: '/assets/option2/mobile/Section_7_assets/Section_7_375x765.png',
      },
      section8: {
        desktop: '/assets/option2/desktop/Section_8_assets/Section_8_1920x711.png',
        mobile: '/assets/option2/mobile/Section_8_assets/Section_8_375x711.png',
        images: [
          '/assets/option2/desktop/Section_8_assets/Before_Pic_With_Shadow.png',
          '/assets/option2/desktop/Section_8_assets/After_Pic_With_Shadow.png',
        ],
      },
      section9: {
        desktop: '/assets/option2/desktop/Section_9_assets/Section_9_1920x500.png',
        mobile: '/assets/option2/mobile/Section_9_assets/Section_9_BG_375x890.png',
      },
      section10: {
        desktop: '/assets/option2/desktop/Section_10_assets/Section_10_1920x700.png',
        mobile: '/assets/option2/mobile/Section_10_assets/Section_10_BG_375x815.png',
        images: ['/assets/option2/desktop/Section_10_assets/Small_Bottle.png'],
      },
    },
  },

  content: {
    hero: {
      headline: 'Age Gracefully with Confidence',
      subheadline: 'Advanced Skin Rejuvenation with 387 Human Growth Factors',
      formTitle: 'Begin Your Journey',
      ctaText: 'Buy Now',
    },
    section2: {
      title: 'What is ReLuma?',
      description: 'ReLuma harnesses 387 human growth factors derived from ethically sourced stem cells to reduce wrinkles, tighten skin, and restore your natural luminosity. Specifically formulated for mature skin that deserves the best care.',
      ctaText: 'Learn More',
    },
    section3: {
      title: 'Why Choose ReLuma?',
      features: [
        {
          title: 'Firmness & Elasticity',
          description: 'Restore your skin\'s natural resilience and youthful bounce',
        },
        {
          title: 'Deep Moisture',
          description: 'Intensive hydration for mature, dry skin',
        },
        {
          title: 'Smoother Texture',
          description: 'Reduce deep wrinkles and fine lines',
        },
        {
          title: 'Even Skin Tone',
          description: 'Fade age spots and discoloration',
        },
      ],
    },
    section4: {
      title: 'Real Results, Real People',
      description: 'See how ReLuma transforms mature skin',
      image: '/assets/option2/desktop/Section_4_assets/Section_4_Older_Girl_Option2.png',
    },
    section5: {
      title: 'What Our Customers Say',
      testimonials: [
        {
          name: 'Margaret S.',
          quote: 'At 62, I never thought my skin could look this radiant. ReLuma has been transformative.',
          rating: 5,
        },
        {
          name: 'Patricia L.',
          quote: 'Finally, a product that delivers on its promises. My skin feels decades younger.',
          rating: 5,
        },
        {
          name: 'Barbara M.',
          quote: 'I\'ve tried countless products, but ReLuma is the only one that made a visible difference.',
          rating: 5,
        },
      ],
    },
    section6: {
      ctaText: 'Buy Now',
      ctaSubtext: 'Invest in your skin today',
    },
    section7: {
      title: 'The Science of Growth Factors',
      content: 'As we age, our skin produces fewer growth factors, leading to visible signs of aging. ReLuma\'s 387 growth factors work synergistically to rejuvenate mature skin at the cellular level, providing the nutrients your skin needs to maintain its youthful appearance.',
      ctaText: 'Learn More',
    },
    section8: {
      title: 'See the Transformation',
      beforeImage: '/assets/option2/desktop/Section_8_assets/Before_Pic_With_Shadow.png',
      afterImage: '/assets/option2/desktop/Section_8_assets/After_Pic_With_Shadow.png',
      description: 'Remarkable results in as little as 4 weeks',
    },
    section9: {
      title: 'How to Use ReLuma',
      content: 'For optimal results, apply ReLuma serum to clean, dry skin twice daily. Especially beneficial after professional treatments, peels, and procedures. Safe to use with Retin-A and AHAs. Natural anti-inflammatory properties help calm sensitive, mature skin.',
    },
    section10: {
      title: 'Ready to Transform Your Skin?',
      description: 'Join thousands of satisfied customers and experience the ReLuma difference',
      ctaText: 'Buy Now',
    },
    footer: {
      socialLinks: [
        {
          platform: 'Facebook',
          url: 'https://facebook.com/reluma',
          icon: '/assets/option2/icons/023-facebook.svg',
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com/reluma',
          icon: '/assets/option2/icons/044-instagram.svg',
        },
        {
          platform: 'LinkedIn',
          url: 'https://linkedin.com/company/reluma',
          icon: '/assets/option2/icons/052-linkedin.svg',
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

  theme: {
    primaryColor: '#7A5C47', // Richer, warmer brown
    secondaryColor: '#F8F5F2', // Softer cream background
    accentColor: '#B8956A', // Elegant gold accent
    backgroundColor: '#FFFFFF',
    textColor: '#2C2C2C',
    fontFamily: 'var(--font-avenir)',
  },
};
