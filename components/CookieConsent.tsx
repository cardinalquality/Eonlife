'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a small delay for better UX
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = async () => {
    // Save consent to localStorage
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());

    // Save consent to database
    try {
      await fetch('/api/consent/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'cookies',
          accepted: true
        }),
      });
    } catch (error) {
      console.error('Failed to save consent:', error);
    }

    // Enable analytics (if you have Google Analytics or similar)
    enableAnalytics();

    setShowBanner(false);
  };

  const declineCookies = async () => {
    // Save declined consent to localStorage
    localStorage.setItem('cookie-consent', 'declined');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());

    // Save declined consent to database
    try {
      await fetch('/api/consent/accept', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'cookies',
          accepted: false
        }),
      });
    } catch (error) {
      console.error('Failed to save consent:', error);
    }

    setShowBanner(false);
  };

  const enableAnalytics = () => {
    // Enable Google Analytics or other analytics tools
    // Example: window.gtag('consent', 'update', { analytics_storage: 'granted' });
    if (typeof window !== 'undefined') {
      // Add your analytics initialization code here
      console.log('Analytics enabled');
    }
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 md:p-6 z-50 shadow-2xl"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent banner"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">We value your privacy</h3>
            <p className="text-sm text-gray-300">
              We use cookies to improve your experience, analyze site traffic, and personalize content.
              By clicking "Accept", you consent to our use of cookies.
              <Link
                href="/privacy"
                className="underline ml-1 hover:text-white transition-colors"
              >
                Learn more about our privacy practices
              </Link>
            </p>
          </div>
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={declineCookies}
              className="px-6 py-2 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white hover:text-gray-900 transition-all font-semibold"
              aria-label="Decline cookies"
            >
              Decline
            </button>
            <button
              onClick={acceptCookies}
              className="px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition-all font-semibold shadow-lg"
              aria-label="Accept cookies"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
