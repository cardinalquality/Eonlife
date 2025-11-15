# Utility Scripts

This directory contains utility scripts for optimizing and maintaining the ReLuma website.

## Image Optimization Script

### `convert-images-to-webp.js`

Converts PNG and JPEG images to WebP format for better compression and performance.

**Important Note:** Next.js automatically serves images in WebP/AVIF format when using the `<Image>` component, so this script is **optional**. It can be useful for pre-converting images if you need the actual WebP files.

### Usage

1. Install sharp (if not already installed):
   ```bash
   npm install --save-dev sharp
   ```

2. Run the script:
   ```bash
   node scripts/convert-images-to-webp.js
   ```

### What it does

- Scans the `public/assets` directory recursively
- Converts all `.png`, `.jpg`, and `.jpeg` files to `.webp`
- Skips files that have already been converted
- Shows file size savings for each conversion
- Preserves original files (doesn't delete them)

### Performance Benefits

WebP images are typically:
- 25-35% smaller than JPEG at equivalent quality
- 25-50% smaller than PNG for photographic images
- Supported by all modern browsers (95%+ coverage)

## Other Optimizations

The website already includes several performance optimizations:

1. **Automatic Image Optimization** - Next.js Image component handles format conversion
2. **Lazy Loading** - Images load as needed while scrolling
3. **Blur Placeholders** - Smooth loading transitions
4. **CDN Caching** - Static assets cached for 1 year
5. **Code Splitting** - JavaScript loaded on-demand
6. **Modern Image Formats** - AVIF and WebP support
7. **Compression** - Gzip/Brotli compression enabled
8. **Web Vitals Tracking** - Performance monitoring built-in
