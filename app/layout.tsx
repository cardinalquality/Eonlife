import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { getActiveProduct } from "@/lib/product-registry";

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

export async function generateMetadata(): Promise<Metadata> {
  const product = await getActiveProduct();
  return {
    title: product.metadata.title,
    description: product.metadata.description,
    keywords: product.metadata.keywords,
    openGraph: {
      title: product.metadata.title,
      description: product.metadata.description,
      images: product.metadata.ogImage ? [product.metadata.ogImage] : undefined,
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
      </head>
      <body className={`${avenirNext.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
