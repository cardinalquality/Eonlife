import Image from 'next/image';

interface ResponsiveImageProps {
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  priority?: boolean;
  className?: string;
  desktopWidth?: number;
  desktopHeight?: number;
  mobileWidth?: number;
  mobileHeight?: number;
  quality?: number;
  blurDataURL?: string;
  sizes?: string;
}

// Simple blur placeholder generator (base64 encoded tiny image)
const shimmer = (w: number, h: number) => `
<svg width="${w}" height="${h}" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="g">
      <stop stop-color="#F5F1ED" offset="20%" />
      <stop stop-color="#D4A574" offset="50%" />
      <stop stop-color="#F5F1ED" offset="70%" />
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#F5F1ED" />
  <rect id="r" width="${w}" height="${h}" fill="url(#g)" />
  <animate xlink:href="#r" attributeName="x" from="-${w}" to="${w}" dur="1s" repeatCount="indefinite"  />
</svg>`;

const toBase64 = (str: string) =>
  typeof window === 'undefined'
    ? Buffer.from(str).toString('base64')
    : window.btoa(str);

export default function ResponsiveImage({
  desktopSrc,
  mobileSrc,
  alt,
  priority = false,
  className = '',
  desktopWidth = 1920,
  desktopHeight = 900,
  mobileWidth = 375,
  mobileHeight = 400,
  quality = 90,
  blurDataURL,
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
}: ResponsiveImageProps) {
  const effectiveMobileSrc = mobileSrc || desktopSrc;

  // Use custom blur placeholder or generate shimmer
  const placeholder: 'blur' | 'empty' | undefined = blurDataURL
    ? 'blur'
    : priority
      ? undefined
      : 'blur';

  const placeholderData = blurDataURL ||
    (priority ? undefined : `data:image/svg+xml;base64,${toBase64(shimmer(700, 475))}`);

  return (
    <>
      {/* Desktop image */}
      <Image
        src={desktopSrc}
        alt={alt}
        width={desktopWidth}
        height={desktopHeight}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholderData}
        sizes={sizes}
        className={`hidden md:block ${className}`}
      />

      {/* Mobile image */}
      <Image
        src={effectiveMobileSrc}
        alt={alt}
        width={mobileWidth}
        height={mobileHeight}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={placeholderData}
        sizes={sizes}
        className={`block md:hidden ${className}`}
      />
    </>
  );
}
