'use client';

import { useState } from 'react';
import { useTemplate } from '@/lib/template-context';
import ResponsiveImage from '../ResponsiveImage';
import { schemas } from '@/lib/validation';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export default function HeroSection() {
  const { currentTemplate } = useTemplate();
  const { hero } = currentTemplate.content;
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [formState, setFormState] = useState<FormState>('idle');
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const validateForm = () => {
    const newErrors: { name?: string; email?: string } = {};

    // Validate name
    const nameValidation = schemas.name.safeParse(name);
    if (!nameValidation.success) {
      newErrors.name = nameValidation.error.errors[0]?.message || 'Invalid name';
    }

    // Validate email
    const emailValidation = schemas.email.safeParse(email);
    if (!emailValidation.success) {
      newErrors.email = emailValidation.error.errors[0]?.message || 'Invalid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    setFormState('submitting');

    try {
      // Submit to newsletter API
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, consent: true })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to subscribe');
      }

      setFormState('success');
      setSuccessMessage('Success! Check your email to confirm your subscription.');
      setEmail('');
      setName('');
      setErrors({});

      // Reset success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setFormState('idle');
      }, 5000);
    } catch (error) {
      setFormState('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');

      // Reset error message after 5 seconds
      setTimeout(() => {
        setErrorMessage('');
        setFormState('idle');
      }, 5000);
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

            {/* Success Message */}
            {successMessage && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm font-medium">{successMessage}</p>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm font-medium">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    // Clear error when user starts typing
                    if (errors.name) {
                      setErrors({ ...errors, name: undefined });
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your name"
                  required
                  disabled={formState === 'submitting'}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    // Clear error when user starts typing
                    if (errors.email) {
                      setErrors({ ...errors, email: undefined });
                    }
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="you@example.com"
                  required
                  disabled={formState === 'submitting'}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={formState === 'submitting'}
                className={`w-full px-6 py-4 bg-primary text-white rounded-lg font-semibold text-lg shadow-md transition-all ${
                  formState === 'submitting'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-accent hover:shadow-lg transform hover:scale-[1.02]'
                }`}
              >
                {formState === 'submitting' ? 'Submitting...' : 'Get My ReLuma'}
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
