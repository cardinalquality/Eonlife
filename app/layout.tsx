import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { CookieConsent } from "@/components/CookieConsent";

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
  title: "ReLuma - Discover Radiant, Youthful Skin",
  description: "Powered by 387 Human Growth Factors for comprehensive skin rejuvenation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${avenirNext.variable} font-sans antialiased`}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
