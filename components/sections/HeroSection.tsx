'use client';

import { useState } from 'react';
import { useTemplate } from '@/lib/template-context';
import ResponsiveImage from '../ResponsiveImage';

export default function HeroSection() {
  const { currentTemplate } = useTemplate();
  const { hero } = currentTemplate.content;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous messages
    setSuccessMessage('');
    setErrorMessage('');
    setIsLoading(true);

    try {
      // Call the API endpoint
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success
        setSuccessMessage(`Welcome ${data.firstName}! Check your email to get started.`);
        setEmail('');
        setName('');
      } else {
        // Error from API
        setErrorMessage(data.error || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setErrorMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="hero" className="relative min-h-screen pt-16 flex items-center">
      {/* Background Image */}
      <div className="absolute inset-0 -z-10">
        <ResponsiveImage
          desktopSrc={currentTemplate.assets.heroBackground.desktop}
          mobileSrc={currentTemplate.assets.heroBackground.mobile}
          alt="Hero Background"
          priority
          className="w-full h-full object-cover"
          desktopWidth={1920}
          desktopHeight={900}
          mobileWidth={375}
          mobileHeight={397}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left column - Hero content */}
          <div className="text-white space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              {hero.headline}
            </h1>
            <p className="text-xl md:text-2xl text-white/90">
              {hero.subheadline}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="px-8 py-4 bg-primary text-white rounded-full hover:bg-accent transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                {hero.ctaText}
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-all font-semibold text-lg border border-white/30">
                Learn More
              </button>
            </div>
          </div>

          {/* Right column - Lead capture form */}
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md mx-auto w-full">
            <h2 className="text-2xl font-bold text-foreground mb-2">
              {hero.formTitle}
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands experiencing radiant skin
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading || !!successMessage}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading || !!successMessage}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="you@example.com"
                  required
                />
              </div>

              {/* Success Message */}
              {successMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-800 text-sm font-medium">{successMessage}</p>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !!successMessage}
                className="w-full px-6 py-4 bg-primary text-white rounded-lg hover:bg-accent transition-all font-semibold text-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? 'Subscribing...' : 'Get My ReLuma'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                By submitting, you agree to our Terms & Privacy Policy
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
