import React from 'react';

interface StructuredDataProps {
  data: object;
}

export function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Organization Schema
export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ReLuma',
    url: 'https://reluma.com',
    logo: 'https://reluma.com/assets/option1/logo.png',
    description: 'Premium skincare powered by 387 Human Growth Factors for comprehensive skin rejuvenation',
    sameAs: [
      'https://facebook.com/reluma',
      'https://instagram.com/reluma',
      'https://twitter.com/reluma',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: 'English',
    },
  };

  return <StructuredData data={schema} />;
}

// Product Schema
export function ProductSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'ReLuma Skin Rejuvenation System',
    description: 'Revolutionary skincare powered by 387 Human Growth Factors for comprehensive skin rejuvenation and anti-aging',
    image: 'https://reluma.com/assets/option1/desktop/hero-background-desktop.png',
    brand: {
      '@type': 'Brand',
      name: 'ReLuma',
    },
    offers: {
      '@type': 'Offer',
      url: 'https://reluma.com',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'ReLuma',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '1247',
      bestRating: '5',
      worstRating: '1',
    },
  };

  return <StructuredData data={schema} />;
}

// FAQ Schema
export function FAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What are Human Growth Factors in skincare?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Human Growth Factors are naturally occurring proteins that help stimulate cell growth, healing, and regeneration. Our formula contains 387 different growth factors that work together to rejuvenate your skin at the cellular level.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to see results?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most customers notice visible improvements within 2-4 weeks of consistent use. Optimal results are typically achieved after 8-12 weeks of regular application.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is ReLuma suitable for all skin types?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, ReLuma is formulated to be safe and effective for all skin types, including sensitive skin. Our gentle, science-backed formula is dermatologist-tested and free from harsh chemicals.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I use ReLuma products?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Apply ReLuma serum to clean, dry skin twice daily - once in the morning and once at night. Gently massage the product into your face and neck using upward motions until fully absorbed.',
        },
      },
    ],
  };

  return <StructuredData data={schema} />;
}

// Website Schema
export function WebsiteSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ReLuma',
    url: 'https://reluma.com',
    description: 'Premium skincare powered by 387 Human Growth Factors',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://reluma.com/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <StructuredData data={schema} />;
}

// Breadcrumb Schema
export function BreadcrumbSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://reluma.com',
      },
    ],
  };

  return <StructuredData data={schema} />;
}
