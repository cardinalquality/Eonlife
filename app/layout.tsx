import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { WebVitals } from "@/components/WebVitals";

const avenirNext = localFont({
  src: [
    {
      path: "../public/fonts/AvenirNextLTPro-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/AvenirNextLTPro-Demi.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/AvenirNextLTPro-Bold.otf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-avenir",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://reluma.com'),
  title: {
    default: "ReLuma - Discover Radiant, Youthful Skin",
    template: "%s | ReLuma - Premium Skincare",
  },
  description: "Powered by 387 Human Growth Factors for comprehensive skin rejuvenation. Experience the science-backed solution for radiant, youthful skin with ReLuma's revolutionary skincare system.",
  keywords: [
    'skincare',
    'anti-aging',
    'human growth factors',
    'skin rejuvenation',
    'youthful skin',
    'premium skincare',
    'ReLuma',
    'wrinkle reduction',
    'skin health',
    'beauty products',
    'dermatology',
    'skin science',
  ],
  authors: [{ name: 'ReLuma' }],
  creator: 'ReLuma',
  publisher: 'ReLuma',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://reluma.com',
    siteName: 'ReLuma',
    title: 'ReLuma - Discover Radiant, Youthful Skin',
    description: 'Powered by 387 Human Growth Factors for comprehensive skin rejuvenation. Experience science-backed skincare that delivers visible results.',
    images: [
      {
        url: '/assets/option1/desktop/hero-background-desktop.png',
        width: 1920,
        height: 1080,
        alt: 'ReLuma - Premium Skincare for Radiant Skin',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReLuma - Discover Radiant, Youthful Skin',
    description: 'Powered by 387 Human Growth Factors for comprehensive skin rejuvenation.',
    images: ['/assets/option1/desktop/hero-background-desktop.png'],
    creator: '@reluma',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/assets/option1/logo.png',
    apple: '/assets/option1/logo.png',
  },
  manifest: '/manifest.json',
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  alternates: {
    canonical: 'https://reluma.com',
  },
  category: 'Beauty & Personal Care',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${avenirNext.variable} font-sans antialiased`}>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
