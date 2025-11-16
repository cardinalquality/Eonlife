/**
 * Image Optimization Utility Script
 *
 * NOTE: Next.js automatically serves images in WebP/AVIF format when using the Image component,
 * so this script is optional. It can be used for pre-converting images if needed.
 *
 * To use this script:
 * 1. Install sharp: npm install --save-dev sharp
 * 2. Run: node scripts/convert-images-to-webp.js
 */

const fs = require('fs');
const path = require('path');

async function convertImagesToWebP() {
  console.log('📸 Image Optimization Script');
  console.log('================================\n');

  // Check if sharp is installed
  let sharp;
  try {
    sharp = require('sharp');
  } catch (error) {
    console.log('❌ Sharp is not installed.');
    console.log('\n📦 To use this script, install sharp:');
    console.log('   npm install --save-dev sharp\n');
    console.log('💡 Note: Next.js automatically serves images in WebP/AVIF format');
    console.log('   when using the Image component, so this script is optional.\n');
    return;
  }

  const publicDir = path.join(__dirname, '..', 'public');
  const assetsDir = path.join(publicDir, 'assets');

  if (!fs.existsSync(assetsDir)) {
    console.log('❌ Assets directory not found:', assetsDir);
    return;
  }

  // Image extensions to convert
  const imageExtensions = ['.png', '.jpg', '.jpeg'];
  let convertedCount = 0;
  let skippedCount = 0;

  async function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await processDirectory(filePath);
      } else {
        const ext = path.extname(file).toLowerCase();

        if (imageExtensions.includes(ext)) {
          const webpPath = filePath.replace(ext, '.webp');

          // Skip if WebP version already exists
          if (fs.existsSync(webpPath)) {
            skippedCount++;
            continue;
          }

          try {
            const originalSize = stat.size;

            // Convert to WebP
            await sharp(filePath)
              .webp({ quality: 90 })
              .toFile(webpPath);

            const webpSize = fs.statSync(webpPath).size;
            const savings = ((originalSize - webpSize) / originalSize * 100).toFixed(1);

            console.log(`✅ ${path.relative(publicDir, filePath)}`);
            console.log(`   Original: ${(originalSize / 1024).toFixed(1)}KB`);
            console.log(`   WebP: ${(webpSize / 1024).toFixed(1)}KB (${savings}% smaller)\n`);

            convertedCount++;
          } catch (error) {
            console.log(`❌ Error converting ${file}:`, error.message);
          }
        }
      }
    }
  }

  console.log('🔍 Scanning for images to convert...\n');
  await processDirectory(assetsDir);

  console.log('\n================================');
  console.log(`✅ Converted: ${convertedCount} images`);
  console.log(`⏭️  Skipped: ${skippedCount} images (already exist)`);
  console.log('\n💡 Remember to update image paths in your code to use .webp extension');
  console.log('   Or continue using Next.js Image component which handles this automatically!\n');
}

// Handle both module and direct execution
if (require.main === module) {
  convertImagesToWebP().catch(console.error);
}

module.exports = { convertImagesToWebP };
