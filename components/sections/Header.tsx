'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTemplate } from '@/lib/template-context';

export default function Header() {
  const { currentTemplate } = useTemplate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Image
              src={currentTemplate.assets.logo}
              alt="ReLuma Logo"
              width={120}
              height={40}
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#benefits" className="text-foreground hover:text-primary transition-colors">
              Benefits
            </a>
            <a href="#science" className="text-foreground hover:text-primary transition-colors">
              Science
            </a>
            <a href="#testimonials" className="text-foreground hover:text-primary transition-colors">
              Testimonials
            </a>
            <a href="#results" className="text-foreground hover:text-primary transition-colors">
              Results
            </a>
          </nav>

          {/* Social Icons & CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {currentTemplate.content.footer.socialLinks.map((social) => (
              <a
                key={social.platform}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:text-primary transition-colors"
              >
                <span className="sr-only">{social.platform}</span>
                <div className="w-5 h-5">
                  {/* Using simple SVG placeholders since we don't have the actual icons yet */}
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" opacity="0.3" />
                  </svg>
                </div>
              </a>
            ))}
            <button className="ml-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors font-semibold">
              Buy Now
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-foreground hover:text-primary"
          >
            <span className="sr-only">Open menu</span>
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <a
              href="#benefits"
              className="block px-3 py-2 text-foreground hover:bg-secondary rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Benefits
            </a>
            <a
              href="#science"
              className="block px-3 py-2 text-foreground hover:bg-secondary rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Science
            </a>
            <a
              href="#testimonials"
              className="block px-3 py-2 text-foreground hover:bg-secondary rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Testimonials
            </a>
            <a
              href="#results"
              className="block px-3 py-2 text-foreground hover:bg-secondary rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Results
            </a>
            <button className="w-full mt-4 px-6 py-2 bg-primary text-white rounded-full hover:bg-accent transition-colors font-semibold">
              Buy Now
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
