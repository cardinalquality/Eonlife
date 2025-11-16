'use client';

import { useProduct } from '@/lib/product-context';
import Image from 'next/image';
import { trackOutboundLink, trackSocialShare } from '@/lib/analytics';

export default function Footer() {
  const { currentVariant, currentProduct } = useProduct();
  const { footer } = currentVariant.content;

  if (!footer) {
    return null;
  }

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Logo & Description */}
          <div className="md:col-span-2">
            <Image
              src={currentProduct.branding.logo}
              alt={`${currentProduct.name} Logo`}
              width={120}
              height={40}
              className="mb-4 brightness-0 invert"
            />
            <p className="text-gray-400 max-w-md">
              Transform your skin with the power of 387 human growth factors.
              Experience radiant, youthful skin that lasts.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footer.links?.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.url}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connect With Us</h3>
            <div className="flex gap-4">
              {footer.socialLinks?.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackSocialShare(social.platform.toLowerCase(), 'footer_link')}
                  className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                >
                  <span className="sr-only">{social.platform}</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="8" />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              {footer.copyrightText}
            </p>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="/privacy" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="/terms" className="hover:text-white transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
