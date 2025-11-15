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
}

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
}: ResponsiveImageProps) {
  const effectiveMobileSrc = mobileSrc || desktopSrc;

  return (
    <>
      {/* Desktop image */}
      <Image
        src={desktopSrc}
        alt={alt}
        width={desktopWidth}
        height={desktopHeight}
        priority={priority}
        className={`hidden md:block ${className}`}
      />

      {/* Mobile image */}
      <Image
        src={effectiveMobileSrc}
        alt={alt}
        width={mobileWidth}
        height={mobileHeight}
        priority={priority}
        className={`block md:hidden ${className}`}
      />
    </>
  );
}
