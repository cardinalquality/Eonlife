import { TemplateConfig } from '@/lib/types/template';

export const option1Config: TemplateConfig = {
  name: 'Option 1 - Youthful Radiance',
  description: 'Modern landing page targeting younger demographic with clean, vibrant design',

  assets: {
    logo: '/assets/option1/logo.png',
    heroBackground: {
      desktop: '/assets/option1/desktop/Section_1_assets/Section_1_1920x900.png',
      mobile: '/assets/option1/mobile/Section_1_assets/375x397_Bg_pic_1.png',
    },
    sections: {
      section2: {
        desktop: '/assets/option1/desktop/Section_2_assets/Section_2_1920x600.png',
        mobile: '/assets/option1/mobile/Section_2_assets/Section_2_375x399.png',
        images: ['/assets/option1/desktop/Section_2_assets/Small_Bottles.png'],
      },
      section3: {
        desktop: '/assets/option1/desktop/Section_3_assets/Section_3_1920x700.png',
        mobile: '/assets/option1/mobile/Section_3_assets/Section_3_375x1062.png',
        images: ['/assets/option1/desktop/Section_3_assets/Small_Bottle.png'],
      },
      section4: {
        desktop: '/assets/option1/desktop/Section_4_assets/Section_4_1920x550.png',
        mobile: '/assets/option1/mobile/Section_4_assets/Section_4_375x1123.png',
        images: [
          '/assets/option1/desktop/Section_4_assets/Section_4_Girl_Option1_589x550.png',
          '/assets/option1/desktop/Section_4_assets/Section_4_Bottles.png',
        ],
      },
      section5: {
        desktop: '/assets/option1/desktop/Section_5_assets/Section_5_1920x700.png',
        mobile: '/assets/option1/mobile/Section_5&6_assets/Section_5_BG.png',
      },
      section6: {
        desktop: '/assets/option1/desktop/Section_6_assets/Section_6_1920x150.png',
      },
      section7: {
        desktop: '/assets/option1/desktop/Section_7_assets/Section_7_1920x700.png',
        mobile: '/assets/option1/mobile/Section_7_assets/Section_7_375x765.png',
      },
      section8: {
        desktop: '/assets/option1/desktop/Section_8_assets/Section_8_1920x711.png',
        mobile: '/assets/option1/mobile/Section_8_assets/Section_8_375x711.png',
        images: [
          '/assets/option1/desktop/Section_8_assets/Before_Pic_With_Shadow.png',
          '/assets/option1/desktop/Section_8_assets/After_Pic_With_Shadow.png',
        ],
      },
      section9: {
        desktop: '/assets/option1/desktop/Section_9_assets/Section_9_1920x500.png',
        mobile: '/assets/option1/mobile/Section_9_assets/Section_9_BG_375x890.png',
      },
      section10: {
        desktop: '/assets/option1/desktop/Section_10_assets/Section_10_1920x700.png',
        mobile: '/assets/option1/mobile/Section_10_assets/Section_10_BG_375x815.png',
        images: ['/assets/option1/desktop/Section_10_assets/Small_Bottle.png'],
      },
    },
  },

  content: {
    hero: {
      headline: 'Discover Radiant, Youthful Skin',
      subheadline: 'Powered by 387 Human Growth Factors',
      formTitle: 'Get Started Today',
      ctaText: 'Buy Now',
    },
    section2: {
      title: 'What is ReLuma?',
      description: 'ReLuma harnesses 387 human growth factors derived from ethically sourced stem cells to reduce wrinkles, tighten skin, and restore your natural luminosity. Unlike competitors with fewer than 9 growth factors, ReLuma delivers comprehensive rejuvenation.',
      ctaText: 'Learn More',
    },
    section3: {
      title: 'Why Choose ReLuma?',
      features: [
        {
          title: 'Firmness & Elasticity',
          description: 'Restore your skin\'s natural bounce and resilience',
        },
        {
          title: 'Deep Moisture',
          description: 'Hydrate from within for lasting glow',
        },
        {
          title: 'Smoother Texture',
          description: 'Visibly reduce fine lines and wrinkles',
        },
        {
          title: 'Even Skin Tone',
          description: 'Diminish dark spots and discoloration',
        },
      ],
    },
    section4: {
      title: 'Real Results, Real People',
      description: 'Join thousands who have transformed their skin with ReLuma',
      image: '/assets/option1/desktop/section4/Section_4_Girl_Option1_589x550.png',
    },
    section5: {
      title: 'What Our Customers Say',
      testimonials: [
        {
          name: 'Kim Penney',
          quote: 'This product is amazing! I\'ve noticed significant improvement in my skin\'s texture and tone.',
          rating: 5,
        },
        {
          name: 'Ursula Kaiser',
          quote: 'ReLuma has become an essential part of my skincare routine. The results speak for themselves.',
          rating: 5,
        },
        {
          name: 'Rosa Cardinal',
          quote: 'I was skeptical at first, but after using ReLuma for just a few weeks, my skin looks more radiant than ever.',
          rating: 5,
        },
      ],
    },
    section6: {
      ctaText: 'Buy Now',
      ctaSubtext: 'Transform your skin today',
    },
    section7: {
      title: 'The Science of Growth Factors',
      content: 'Growth factors are naturally occurring proteins that play a crucial role in cellular communication and skin repair. As we age, our skin produces fewer growth factors, leading to visible signs of aging. ReLuma\'s 387 growth factors work synergistically to rejuvenate your skin at the cellular level.',
      ctaText: 'Learn More',
    },
    section8: {
      title: 'See the Difference',
      beforeImage: '/assets/option1/desktop/section8/Before_Pic_With_Shadow.png',
      afterImage: '/assets/option1/desktop/section8/After_Pic_With_Shadow.png',
      description: 'Visible results in as little as 4 weeks',
    },
    section9: {
      title: 'How to Use ReLuma',
      content: 'For optimal results, apply ReLuma serum to clean, dry skin twice daily. Especially beneficial after laser therapy, chemical peels, and invasive procedures. Safe to use with Retin-A and AHAs. Natural anti-inflammatory properties help with rosacea and sensitive skin.',
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
          icon: '/assets/option1/icons/023-facebook.svg',
        },
        {
          platform: 'Instagram',
          url: 'https://instagram.com/reluma',
          icon: '/assets/option1/icons/044-instagram.svg',
        },
        {
          platform: 'LinkedIn',
          url: 'https://linkedin.com/company/reluma',
          icon: '/assets/option1/icons/052-linkedin.svg',
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
    primaryColor: '#8B7355', // Warm brown/beige from branding
    secondaryColor: '#F5F1ED', // Light cream background
    accentColor: '#D4A574', // Gold accent
    backgroundColor: '#FFFFFF',
    textColor: '#2C2C2C',
    fontFamily: 'var(--font-avenir)',
  },
};
