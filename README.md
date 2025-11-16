# ReLuma Landing Page - Template System

A modern, responsive landing page built with Next.js 16, TypeScript, and Tailwind CSS v4. Designed for easy template switching and rapid experimentation with different landing page variants.

## 🚀 Features

- **Template System**: Easily switch between different landing page variants (Option 1, Option 2, etc.)
- **Fully Responsive**: Optimized for desktop (1920px) and mobile (375px) with dedicated image assets
- **Modern Stack**: Next.js 16 App Router, TypeScript, Tailwind CSS v4
- **Custom Fonts**: Avenir Next LT Pro for premium typography
- **Reusable Components**: Modular section components for maximum flexibility
- **Interactive Elements**: Before/After slider, mobile menu, smooth animations
- **E-commerce Integration**: Stripe payments, customer management, subscriptions
- **Multi-Environment Support**: Development, staging, and production environments

## 🌍 Environment Setup

This project supports three environments: **Development**, **Staging**, and **Production**.

### Quick Start (Development)

```bash
# Install dependencies
npm install

# Set up local database and environment
npm run setup:dev

# Start development server
npm run dev
```

### Documentation

- **[Quick Start Guide](docs/QUICK_START.md)** - Get up and running quickly
- **[Environment Guide](docs/ENVIRONMENTS.md)** - Complete environment setup and deployment guide

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run setup:dev        # Set up development database
npm run setup:staging    # Set up staging database
npm run db:studio        # Open database GUI
npm run env:dev          # Copy dev environment template
npm run env:staging      # Copy staging environment template
```

## 📁 Project Structure

```
reluma-landing/
├── app/
│   ├── layout.tsx          # Root layout with font configuration
│   ├── page.tsx             # Main landing page
│   └── globals.css          # Global styles & Tailwind config
├── components/
│   ├── ResponsiveImage.tsx  # Responsive image component
│   └── sections/            # All page sections
│       ├── Header.tsx
│       ├── HeroSection.tsx
│       ├── EducationSection.tsx
│       ├── FeaturesSection.tsx
│       ├── TestimonialsSection.tsx
│       ├── ScienceSection.tsx
│       ├── BeforeAfterSection.tsx
│       └── Footer.tsx
├── lib/
│   ├── template-context.tsx # Template switching context
│   └── types/
│       └── template.ts      # TypeScript type definitions
├── templates/
│   ├── option1/
│   │   └── config.ts        # Option 1 configuration
│   └── option2/             # (Future: Option 2)
│       └── config.ts
└── public/
    ├── fonts/               # Avenir Next font files
    └── assets/
        ├── option1/         # Option 1 assets
        │   ├── desktop/
        │   └── mobile/
        └── option2/         # Option 2 assets (future)
```

## 🎨 Switching Templates

### Quick Switch (Development)

To switch between templates, simply change the `initialVariant` prop in `app/page.tsx`:

```tsx
// Option 1
<TemplateProvider initialVariant="option1">

// Option 2 (when ready)
<TemplateProvider initialVariant="option2">
```

### Creating a New Template

1. **Create template configuration**:
   ```bash
   cp templates/option1/config.ts templates/option3/config.ts
   ```

2. **Update the configuration** with your new content and asset paths

3. **Register the template** in `lib/template-context.tsx`:
   ```tsx
   const templates: Record<TemplateVariant, TemplateConfig> = {
     option1: option1Config,
     option2: option2Config,
     option3: option3Config, // Add your new template
   };
   ```

4. **Add the variant type** in `lib/types/template.ts`:
   ```tsx
   export type TemplateVariant = 'option1' | 'option2' | 'option3';
   ```

## 📦 Asset Management

### Copying Assets from Reluma Folder

Assets need to be copied from the `Eonlife_Reluma/Reluma Landing Page` folder:

```bash
# Create directory structure
mkdir -p public/assets/option1/{desktop,mobile,icons}

# Copy Option 1 Desktop Assets
cp -r "../Eonlife_Reluma/Reluma Landing Page/Option_1/Export/Desktop/" public/assets/option1/desktop/

# Copy Option 1 Mobile Assets
cp -r "../Eonlife_Reluma/Reluma Landing Page/Option_1/Export/Mobile/" public/assets/option1/mobile/

# Copy Logo
cp "../Eonlife_Reluma/Reluma Landing Page/Option_1/Export/Desktop/Navagation/ReLuma_Logo.png" public/assets/option1/logo.png

# Copy Social Icons
cp "../Eonlife_Reluma/Reluma Landing Page/Option_1/Export/Desktop/Navagation/"*.svg public/assets/option1/icons/
```

### Expected Asset Structure

```
public/assets/option1/
├── logo.png
├── desktop/
│   ├── section1/
│   │   ├── Section_1_1920x900.png
│   │   ├── BuyNow_CTA.png
│   │   └── Small_Bottle.png
│   ├── section2/
│   │   ├── Section_2_1920x600.png
│   │   └── Small_Bottles.png
│   ├── section3/ ... section10/
│   └── footer/
├── mobile/
│   ├── section1/ ... section10/
│   └── footer/
└── icons/
    ├── 023-facebook.svg
    ├── 044-instagram.svg
    └── 052-linkedin.svg
```

## 🛠️ Development

```bash
# Install dependencies
npm install --cache=/tmp/npm-cache

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Visit [http://localhost:3000](http://localhost:3000) to see your landing page.

## 🎯 Template Configuration

Each template configuration includes:

- **Assets**: Paths to images, logos, icons
- **Content**: All text content, CTAs, testimonials
- **Theme**: Colors, fonts, styling preferences

Example template config structure:

```tsx
{
  name: 'Option 1 - Youthful Radiance',
  description: 'Modern landing page targeting younger demographic',
  assets: {
    logo: '/assets/option1/logo.png',
    heroBackground: {
      desktop: '/assets/option1/desktop/section1/Section_1_1920x900.png',
      mobile: '/assets/option1/mobile/section1/Section_1_375x397.png',
    },
    // ... more assets
  },
  content: {
    hero: {
      headline: 'Discover Radiant, Youthful Skin',
      subheadline: 'Powered by 387 Human Growth Factors',
      // ... more content
    },
    // ... more sections
  },
  theme: {
    primaryColor: '#8B7355',
    secondaryColor: '#F5F1ED',
    // ... more theme values
  }
}
```

## 🎨 Customizing Colors

Colors are configured in two places:

1. **Global CSS** (`app/globals.css`):
   ```css
   :root {
     --primary: #8B7355;
     --secondary: #F5F1ED;
     --accent: #D4A574;
   }
   ```

2. **Template Config** (`templates/option1/config.ts`):
   ```tsx
   theme: {
     primaryColor: '#8B7355',
     secondaryColor: '#F5F1ED',
     accentColor: '#D4A574',
   }
   ```

## 📱 Responsive Design

- **Desktop**: 1920px width (images optimized for this size)
- **Tablet**: 768px breakpoint (uses desktop images, scaled down)
- **Mobile**: 375px width (dedicated mobile-optimized images)

The `ResponsiveImage` component automatically serves the correct image size.

## 🔄 Making Changes

### Updating Content

Edit the template configuration file:
```tsx
// templates/option1/config.ts
content: {
  hero: {
    headline: 'Your New Headline',
    subheadline: 'Your New Subheadline',
  }
}
```

### Adding New Sections

1. Create component in `components/sections/NewSection.tsx`
2. Import and add to `app/page.tsx`
3. Add content to template config
4. Update TypeScript types in `lib/types/template.ts`

### Styling Components

All components use Tailwind CSS classes. Key colors:
- `bg-primary` - Primary brand color
- `bg-secondary` - Secondary/background color
- `bg-accent` - Accent/highlight color
- `text-foreground` - Main text color

## 🚢 Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

### Other Platforms

Build the project and deploy the `.next` folder:

```bash
npm run build
# Deploy .next folder to your hosting provider
```

## 📝 Notes

- **Font Files**: Ensure Avenir Next fonts are in `public/fonts/`
- **Image Optimization**: Next.js automatically optimizes images
- **Performance**: Use `priority` prop on above-fold images
- **SEO**: Update metadata in `app/layout.tsx`

## 🎯 Next Steps

1. Copy assets from Reluma Landing Page folder (see Asset Management section)
2. Test the landing page with Option 1
3. Create Option 2 configuration
4. Add A/B testing if needed
5. Integrate with your e-commerce platform

## 🤝 Support

For issues or questions about the template system, refer to:
- Next.js Docs: https://nextjs.org/docs
- Tailwind CSS v4: https://tailwindcss.com/docs
- TypeScript: https://www.typescriptlang.org/docs

---

Built with Next.js 16, TypeScript, and Tailwind CSS v4
