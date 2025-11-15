'use client';

import { TemplateProvider } from '@/lib/template-context';
import Header from '@/components/sections/Header';
import HeroSection from '@/components/sections/HeroSection';
import EducationSection from '@/components/sections/EducationSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ScienceSection from '@/components/sections/ScienceSection';
import BeforeAfterSection from '@/components/sections/BeforeAfterSection';
import Footer from '@/components/sections/Footer';
import { trackCTAClick } from '@/lib/analytics';

export default function Home() {
  return (
    <TemplateProvider initialVariant="option1">
      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <EducationSection />
          <FeaturesSection />
          <TestimonialsSection />
          <ScienceSection />
          <BeforeAfterSection />

          {/* Final CTA Section */}
          <section className="py-20 bg-primary text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Skin?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of satisfied customers and experience the ReLuma difference
              </p>
              <button
                onClick={() => trackCTAClick('buy_now', 'final_cta_section')}
                className="px-12 py-4 bg-white text-primary rounded-full hover:bg-accent hover:text-white transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Buy Now
              </button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </TemplateProvider>
  );
}
