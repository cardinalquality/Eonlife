# ReLuma Landing Page - Quick Start Guide

## 🎉 Your Landing Page is Ready!

The development server is running at: **http://localhost:3000**

## ✅ What's Been Set Up

1. **Modern Tech Stack**
   - Next.js 16 with App Router
   - TypeScript for type safety
   - Tailwind CSS v4 for styling
   - Avenir Next custom fonts

2. **Template System**
   - Easy switching between landing page variants
   - Centralized configuration in `templates/option1/config.ts`
   - All content is editable without touching code

3. **Components Built**
   - Header with navigation and mobile menu
   - Hero section with lead capture form
   - Education section (What is ReLuma?)
   - Features section (4 key benefits)
   - Testimonials section (3 customer reviews)
   - Science section (Growth factors education)
   - Before/After comparison slider
   - Footer with social links

4. **Assets Copied**
   - ✅ 71 desktop images
   - ✅ 61 mobile images
   - ✅ 7 social icons
   - ✅ Logo
   - ✅ Custom fonts

## 🚀 How to Make Changes

### Update Text Content

Edit `templates/option1/config.ts`:

```tsx
content: {
  hero: {
    headline: 'Your New Headline Here',
    subheadline: 'Your new subheadline',
    ctaText: 'Buy Now',
  },
  // ... more content
}
```

All changes appear instantly in the browser!

### Change Colors

Edit `app/globals.css`:

```css
:root {
  --primary: #8B7355;    /* Main brand color */
  --secondary: #F5F1ED;  /* Background color */
  --accent: #D4A574;     /* Accent/highlight color */
}
```

### Switch to Option 2 (When Ready)

1. Copy and update the template config:
   ```bash
   cp templates/option1/config.ts templates/option2/config.ts
   ```

2. Edit `templates/option2/config.ts` with new content/assets

3. Update `app/page.tsx`:
   ```tsx
   <TemplateProvider initialVariant="option2">
   ```

4. Save and reload - instant switch!

## 📱 Testing Responsiveness

The page is fully responsive:
- Desktop: 1920px+ (full layout)
- Tablet: 768px-1919px (adjusted layout)
- Mobile: 375px-767px (mobile-optimized)

Use browser DevTools to test different screen sizes.

## 🎨 Customization Tips

### Add a New Section

1. Create component: `components/sections/NewSection.tsx`
2. Add to page: `app/page.tsx`
3. Add content: `templates/option1/config.ts`
4. Update types: `lib/types/template.ts`

### Modify Existing Section

Just edit the component file in `components/sections/`

### Change Button Styles

All buttons use Tailwind classes:
```tsx
className="px-8 py-4 bg-primary text-white rounded-full hover:bg-accent"
```

## 🔧 Useful Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Type check
npx tsc --noEmit

# Lint code
npm run lint
```

## 📂 Key Files

- `app/page.tsx` - Main landing page structure
- `templates/option1/config.ts` - All content & assets
- `app/globals.css` - Global styles & colors
- `components/sections/` - All page sections
- `lib/template-context.tsx` - Template switching logic

## 🎯 Next Steps

1. **Test the page**: Visit http://localhost:3000
2. **Update content**: Edit text in `templates/option1/config.ts`
3. **Customize colors**: Adjust in `app/globals.css`
4. **Add analytics**: Integrate Google Analytics or similar
5. **Connect forms**: Hook up the lead capture form to your CRM
6. **Create Option 2**: When ready to test variant B

## 💡 Pro Tips

- The before/after slider is interactive - drag to compare
- Mobile menu automatically appears on small screens
- All images are optimized by Next.js automatically
- Changes to config files update instantly (hot reload)
- Use the template system to A/B test different approaches

## 🐛 Troubleshooting

**Page won't load?**
- Check the terminal for error messages
- Verify all assets are in `public/assets/option1/`
- Run `npm install --cache=/tmp/npm-cache` if needed

**Images not showing?**
- Verify paths in `templates/option1/config.ts`
- Check that files exist in `public/assets/option1/`
- Look for typos in filenames

**Fonts not loading?**
- Confirm fonts are in `public/fonts/`
- Check browser console for font loading errors

## 📧 Form Integration

The hero section has a lead capture form. To make it functional:

1. Install a form service (e.g., Formspree, SendGrid)
2. Edit `components/sections/HeroSection.tsx`
3. Add your form endpoint in the `handleSubmit` function

Example with Formspree:
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  await fetch('https://formspree.io/f/YOUR_FORM_ID', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });
};
```

## 🚢 Ready to Deploy?

When ready to go live:

1. Build: `npm run build`
2. Deploy to Vercel (easiest): `vercel`
3. Or deploy to any hosting that supports Next.js

---

**Need Help?** Check the main [README.md](README.md) for detailed documentation.

**Have fun building! 🎨**
