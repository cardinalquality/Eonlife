# Product Setup Guide

Complete guide for adding and managing products in the Eonlife multi-product platform.

## Table of Contents
- [Product System Overview](#product-system-overview)
- [Product Structure](#product-structure)
- [Adding a New Product](#adding-a-new-product)
- [Creating Product Variants](#creating-product-variants)
- [Managing Assets](#managing-assets)
- [Database Integration](#database-integration)
- [Routing & URLs](#routing--urls)
- [Best Practices](#best-practices)
- [Examples](#examples)

---

## Product System Overview

The Eonlife platform uses a **multi-product, multi-variant architecture** that allows you to:

- 🎯 Manage multiple product lines (ReLuma, Longevity Formula, etc.)
- 🎨 Create multiple landing page variants per product (A/B testing)
- 🔧 Configure each product independently (branding, sections, providers)
- 📦 Organize assets per product and variant
- 🌐 Support different routing strategies per product

### Current Products
- **ReLuma** - Anti-aging serum with 387 growth factors
  - Variant: Youthful Radiance (targeting younger demographic)
  - Variant: Mature Elegance (targeting mature demographic)
- **Longevity Formula** - Longevity supplement
  - Variant: Default

---

## Product Structure

### Directory Structure

```
products/
├── reluma/                          # Product line
│   ├── product.config.ts            # Main product configuration
│   └── variants/                    # Landing page variants
│       ├── youthful-radiance.config.ts
│       └── mature-elegance.config.ts
│
├── longevity-formula/
│   ├── product.config.ts
│   └── variants/
│       └── default.config.ts
│
└── [your-product]/                  # Your new product
    ├── product.config.ts
    └── variants/
        └── default.config.ts
```

### Asset Structure

```
public/products/
├── reluma/
│   ├── logo.png
│   ├── og-image.png
│   └── assets/
│       ├── youthful-radiance/       # Variant-specific assets
│       │   ├── desktop/
│       │   │   ├── Section_1_assets/
│       │   │   ├── Section_2_assets/
│       │   │   └── ...
│       │   └── mobile/
│       │       ├── Section_1_assets/
│       │       └── ...
│       └── mature-elegance/
│           ├── desktop/
│           └── mobile/
│
└── longevity-formula/
    ├── logo.png
    └── assets/
```

---

## Adding a New Product

### Step 1: Create Product Directory

```bash
# Create product directory structure
mkdir -p products/my-product/variants
mkdir -p public/products/my-product/assets
```

### Step 2: Create Product Configuration

Create `products/my-product/product.config.ts`:

```typescript
import { ProductConfig } from '@/lib/types/product';
import { defaultVariant } from './variants/default.config';

export const myProduct: ProductConfig = {
  // Unique product identifier (used in URLs, database)
  id: 'my-product',

  // Display name
  name: 'My Product',

  // SEO metadata
  metadata: {
    title: 'My Product - Tagline Here',
    description: 'Product description for SEO (150-160 characters)',
    keywords: ['keyword1', 'keyword2', 'keyword3'],
    ogImage: '/products/my-product/og-image.png',
  },

  // Brand styling
  branding: {
    logo: '/products/my-product/logo.png',
    primaryColor: '#4A5568',      // Main brand color
    secondaryColor: '#F7FAFC',    // Secondary/background color
    accentColor: '#3182CE',       // Accent/highlight color
    backgroundColor: '#FFFFFF',   // Page background
    textColor: '#1A202C',         // Primary text color
    fontFamily: 'var(--font-avenir)', // Font (defined in layout.tsx)
  },

  // Landing page sections to include
  sections: [
    'hero-with-form',
    'education',
    'features',
    'testimonials',
    'science',
    'before-after',
    'footer',
  ],

  // Service providers configuration
  providers: {
    form: 'sendgrid',      // Form handling: 'sendgrid' | 'formspree' | 'none'
    analytics: 'google',    // Analytics: 'google' | 'mixpanel' | 'plausible' | 'none'
    payment: 'stripe',      // Payment: 'stripe' | 'none'
    email: 'sendgrid',      // Email: 'sendgrid' | 'mailchimp' | 'none'
  },

  // Landing page variants
  variants: {
    'default': defaultVariant,
  },
};
```

### Step 3: Create Default Variant

Create `products/my-product/variants/default.config.ts`:

```typescript
import { VariantConfig } from '@/lib/types/product';

export const defaultVariant: VariantConfig = {
  id: 'default',
  name: 'Default',
  description: 'Primary landing page for My Product',

  // Asset paths
  assets: {
    logo: '/products/my-product/logo.png',

    heroBackground: {
      desktop: '/products/my-product/assets/default/desktop/hero-bg.jpg',
      mobile: '/products/my-product/assets/default/mobile/hero-bg.jpg',
    },

    sections: {
      section2: {
        desktop: '/products/my-product/assets/default/desktop/section2-bg.jpg',
        mobile: '/products/my-product/assets/default/mobile/section2-bg.jpg',
        images: [
          '/products/my-product/assets/default/desktop/product-bottle.png',
        ],
      },
      // Add more sections as needed...
    },
  },

  // Content for each section
  content: {
    hero: {
      headline: 'Transform Your Life with My Product',
      subheadline: 'The science-backed solution you\'ve been waiting for',
      formTitle: 'Get Started Today',
      ctaText: 'Buy Now',
      description: 'Join thousands experiencing amazing results',
    },

    section2: {
      title: 'What is My Product?',
      description: 'Detailed description of your product, its benefits, and what makes it unique...',
      ctaText: 'Learn More',
    },

    section3: {
      title: 'Why Choose My Product?',
      features: [
        {
          title: 'Feature 1',
          description: 'Description of feature 1',
        },
        {
          title: 'Feature 2',
          description: 'Description of feature 2',
        },
        {
          title: 'Feature 3',
          description: 'Description of feature 3',
        },
        {
          title: 'Feature 4',
          description: 'Description of feature 4',
        },
      ],
    },

    section4: {
      title: 'Real Results, Real People',
      description: 'Join thousands who have transformed their lives',
      testimonials: [
        {
          name: 'Jane D.',
          location: 'New York, NY',
          rating: 5,
          quote: 'Amazing results after just 2 weeks!',
          image: '/products/my-product/testimonials/jane.jpg',
        },
        {
          name: 'John S.',
          location: 'Los Angeles, CA',
          rating: 5,
          quote: 'I recommend this to everyone!',
          image: '/products/my-product/testimonials/john.jpg',
        },
        {
          name: 'Sarah M.',
          location: 'Chicago, IL',
          rating: 5,
          quote: 'Life-changing product!',
          image: '/products/my-product/testimonials/sarah.jpg',
        },
      ],
    },

    section5: {
      title: 'The Science Behind My Product',
      description: 'Scientific explanation and clinical studies...',
      stats: [
        {
          value: '95%',
          label: 'Customer Satisfaction',
        },
        {
          value: '2 weeks',
          label: 'Visible Results',
        },
        {
          value: '100%',
          label: 'Natural Ingredients',
        },
      ],
    },

    footer: {
      tagline: 'Transform your life today',
      copyright: '© 2024 My Product. All rights reserved.',
      social: {
        facebook: 'https://facebook.com/myproduct',
        instagram: 'https://instagram.com/myproduct',
        twitter: 'https://twitter.com/myproduct',
      },
      links: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Contact Us', href: '/contact' },
      ],
    },
  },
};
```

### Step 4: Register Product in App

Create a central product registry if you want to support multiple products:

Create `lib/products/index.ts`:

```typescript
import { relumaProduct } from '@/products/reluma/product.config';
import { longevityProduct } from '@/products/longevity-formula/product.config';
import { myProduct } from '@/products/my-product/product.config';

export const products = {
  'reluma': relumaProduct,
  'longevity-formula': longevityProduct,
  'my-product': myProduct,
};

export type ProductId = keyof typeof products;
```

### Step 5: Create Product Page

**Option A: Single Product Site (Current Setup)**
Edit `app/page.tsx` to use your product:

```typescript
import { myProduct } from '@/products/my-product/product.config';

export default function HomePage() {
  const variant = myProduct.variants['default'];

  return (
    <ProductPageTemplate
      product={myProduct}
      variant={variant}
    />
  );
}
```

**Option B: Multi-Product Site**
Create `app/products/[productId]/page.tsx`:

```typescript
import { products } from '@/lib/products';
import { ProductPageTemplate } from '@/components/ProductPageTemplate';

export async function generateStaticParams() {
  return Object.keys(products).map((id) => ({
    productId: id,
  }));
}

export default function ProductPage({ params }: { params: { productId: string } }) {
  const product = products[params.productId];
  const variant = product.variants[Object.keys(product.variants)[0]];

  return (
    <ProductPageTemplate
      product={product}
      variant={variant}
    />
  );
}
```

---

## Creating Product Variants

Variants allow you to A/B test different landing page designs for the same product.

### Step 1: Create Variant Configuration

Create `products/my-product/variants/variant-b.config.ts`:

```typescript
import { VariantConfig } from '@/lib/types/product';

export const variantB: VariantConfig = {
  id: 'variant-b',
  name: 'Variant B',
  description: 'Alternative landing page design',

  assets: {
    // Different images/backgrounds
    logo: '/products/my-product/logo.png',
    heroBackground: {
      desktop: '/products/my-product/assets/variant-b/desktop/hero-bg.jpg',
      mobile: '/products/my-product/assets/variant-b/mobile/hero-bg.jpg',
    },
    // ... other assets
  },

  content: {
    // Different copy, headlines, CTAs
    hero: {
      headline: 'Alternative Headline for Testing',
      subheadline: 'Different value proposition',
      // ... rest of content
    },
    // ... other sections
  },
};
```

### Step 2: Register Variant

Add to `products/my-product/product.config.ts`:

```typescript
import { defaultVariant } from './variants/default.config';
import { variantB } from './variants/variant-b.config';

export const myProduct: ProductConfig = {
  // ... other config

  variants: {
    'default': defaultVariant,
    'variant-b': variantB,
  },
};
```

### Step 3: Implement Variant Switching

**Static (Manual):**
```typescript
// Switch in code
const variant = myProduct.variants['variant-b'];
```

**Dynamic (URL-based):**
```typescript
// /products/my-product?variant=variant-b
const searchParams = useSearchParams();
const variantId = searchParams.get('variant') || 'default';
const variant = myProduct.variants[variantId];
```

**A/B Testing (Random):**
```typescript
const variantIds = Object.keys(myProduct.variants);
const randomVariant = variantIds[Math.floor(Math.random() * variantIds.length)];
const variant = myProduct.variants[randomVariant];
```

---

## Managing Assets

### Asset Organization

**Best Practices:**
1. Use descriptive names: `hero-background.jpg` not `img1.jpg`
2. Organize by variant and device
3. Optimize images before uploading
4. Use WebP format for better compression
5. Provide both desktop and mobile versions

### Image Optimization

```bash
# Convert images to WebP
npm install -g sharp-cli

# Optimize desktop images (1920px wide)
sharp -i input.jpg -o output.webp --format webp --width 1920

# Optimize mobile images (375px wide)
sharp -i input.jpg -o output-mobile.webp --format webp --width 375
```

### Asset Paths

Always use absolute paths from `/public`:

```typescript
// ✅ Correct
heroBackground: {
  desktop: '/products/my-product/assets/default/desktop/hero.jpg',
}

// ❌ Wrong
heroBackground: {
  desktop: '../assets/hero.jpg',
}
```

### Using Assets in Components

```typescript
import Image from 'next/image';

<Image
  src={variant.assets.heroBackground.desktop}
  alt="Hero background"
  width={1920}
  height={900}
  priority
/>
```

---

## Database Integration

### Adding Product to Database

Run SQL to add product to database:

```sql
-- Insert product
INSERT INTO products (
  id,
  name,
  description,
  price,
  currency,
  image_url,
  status,
  inventory_count
) VALUES (
  'my-product',
  'My Product',
  'Product description for database',
  9900,  -- Price in cents ($99.00)
  'usd',
  '/products/my-product/logo.png',
  'active',
  1000
);

-- Add product variants (SKUs)
INSERT INTO product_variants (
  id,
  product_id,
  name,
  sku,
  price,
  inventory_count
) VALUES
(
  'my-product-1-month',
  'my-product',
  '1-Month Supply',
  'MP-1M',
  9900,
  500
),
(
  'my-product-3-month',
  'my-product',
  '3-Month Supply',
  'MP-3M',
  24900,
  300
);
```

### Using Prisma

Update `prisma/schema.prisma` if needed, then:

```typescript
import { prisma } from '@/lib/prisma';

// Create product
const product = await prisma.product.create({
  data: {
    id: 'my-product',
    name: 'My Product',
    description: 'Product description',
    price: 9900,
    currency: 'usd',
    imageUrl: '/products/my-product/logo.png',
    status: 'active',
    inventoryCount: 1000,
  },
});
```

---

## Routing & URLs

### URL Structures

**Single Product (Current):**
- Homepage: `/` → Shows product landing page
- Product page: `/products/[id]` → Direct product page

**Multi-Product:**
- Homepage: `/` → Product catalog or main landing
- Product pages: `/products/my-product` → Product landing page
- Variant: `/products/my-product?variant=variant-b`

### Dynamic Routes

Create `app/products/[id]/page.tsx`:

```typescript
import { products } from '@/lib/products';
import { notFound } from 'next/navigation';

export async function generateStaticParams() {
  // Generate all product pages at build time
  return Object.keys(products).map((id) => ({ id }));
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = products[params.id];
  if (!product) return {};

  return {
    title: product.metadata.title,
    description: product.metadata.description,
    keywords: product.metadata.keywords,
    openGraph: {
      images: [product.metadata.ogImage],
    },
  };
}

export default function ProductPage({ params }: { params: { id: string } }) {
  const product = products[params.id];

  if (!product) {
    notFound();
  }

  // Get default variant or from query params
  const variant = product.variants['default'];

  return <ProductPageTemplate product={product} variant={variant} />;
}
```

---

## Best Practices

### Content Organization

**Do:**
- ✅ Keep content in variant configs
- ✅ Use descriptive section names
- ✅ Provide alt text for all images
- ✅ Test all CTAs and links

**Don't:**
- ❌ Hardcode content in components
- ❌ Mix content and styling
- ❌ Use generic image names
- ❌ Forget mobile variants

### Performance

**Image Optimization:**
- Use Next.js `<Image>` component
- Provide `width` and `height`
- Use `priority` for above-fold images
- Use WebP format
- Compress images (< 500KB for desktop, < 200KB for mobile)

**Code Splitting:**
```typescript
// Lazy load heavy components
import dynamic from 'next/dynamic';

const BeforeAfterSection = dynamic(
  () => import('@/components/sections/BeforeAfterSection'),
  { loading: () => <p>Loading...</p> }
);
```

### SEO

**Metadata:**
```typescript
metadata: {
  title: 'Product Name - Key Benefit | Brand',
  description: 'Compelling 150-160 character description with keywords',
  keywords: ['primary keyword', 'secondary keyword', 'brand name'],
  ogImage: '/products/my-product/og-image-1200x630.jpg',
}
```

**Structured Data:**
Add to product page:
```typescript
export default function ProductPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.metadata.description,
    image: product.metadata.ogImage,
    offers: {
      '@type': 'Offer',
      price: '99.00',
      priceCurrency: 'USD',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Page content */}
    </>
  );
}
```

---

## Examples

### Example: Simple Product

Minimal product with one variant:

```typescript
// products/simple-product/product.config.ts
export const simpleProduct: ProductConfig = {
  id: 'simple-product',
  name: 'Simple Product',
  metadata: {
    title: 'Simple Product',
    description: 'A simple product example',
    keywords: [],
  },
  branding: {
    logo: '/products/simple-product/logo.png',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
  },
  sections: ['hero-with-form', 'features', 'footer'],
  providers: {
    form: 'none',
    analytics: 'none',
    payment: 'none',
    email: 'none',
  },
  variants: {
    default: {
      id: 'default',
      name: 'Default',
      assets: { /* ... */ },
      content: { /* ... */ },
    },
  },
};
```

### Example: A/B Testing Setup

Two variants for split testing:

```typescript
// Variant A: Benefit-focused
variantA: {
  content: {
    hero: {
      headline: 'Get Younger-Looking Skin in 2 Weeks',
      ctaText: 'Start Your Journey',
    },
  },
}

// Variant B: Feature-focused
variantB: {
  content: {
    hero: {
      headline: '387 Growth Factors for Complete Skin Renewal',
      ctaText: 'Shop Now',
    },
  },
}
```

### Example: Multi-Language Product

Using variants for different languages:

```typescript
variants: {
  'en': englishVariant,
  'es': spanishVariant,
  'fr': frenchVariant,
}

// Detect language
const lang = getUserLanguage(); // 'en', 'es', 'fr'
const variant = product.variants[lang];
```

---

## Quick Reference

### File Checklist

When adding a new product, create:

- [ ] `products/[product-id]/product.config.ts`
- [ ] `products/[product-id]/variants/default.config.ts`
- [ ] `public/products/[product-id]/logo.png`
- [ ] `public/products/[product-id]/og-image.png`
- [ ] `public/products/[product-id]/assets/default/desktop/`
- [ ] `public/products/[product-id]/assets/default/mobile/`
- [ ] Database entry (SQL or Prisma)
- [ ] Product page route (if multi-product)

### Common Tasks

**Change product displayed on homepage:**
```typescript
// app/page.tsx
import { myProduct } from '@/products/my-product/product.config';
const variant = myProduct.variants['default'];
```

**Switch variant:**
```typescript
const variant = product.variants['variant-b'];
```

**Update product content:**
```typescript
// products/my-product/variants/default.config.ts
content: {
  hero: {
    headline: 'New headline here',
  },
}
```

---

**Need help?** See existing products in `products/reluma/` for complete examples.
