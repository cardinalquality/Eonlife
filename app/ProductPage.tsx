'use client';

import { ProductProvider } from '@/lib/product-context';
import { ProductConfig } from '@/lib/types/product';
import { getSectionComponent } from '@/lib/section-registry';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

interface ProductPageProps {
  product: ProductConfig;
  initialVariant?: string;
}

export default function ProductPage({ product, initialVariant }: ProductPageProps) {
  return (
    <ProductProvider product={product} initialVariant={initialVariant}>
      <div className="min-h-screen">
        {/* Header is always shown */}
        <Header />

        <main>
          {/* Dynamically render sections based on product configuration */}
          {product.sections.map((sectionType, index) => {
            // Skip header and footer as they're handled separately
            if (sectionType === 'header' || sectionType === 'footer') {
              return null;
            }

            const SectionComponent = getSectionComponent(sectionType);

            if (!SectionComponent) {
              console.warn(`Section component not found for type: ${sectionType}`);
              return null;
            }

            return <SectionComponent key={`${sectionType}-${index}`} />;
          })}

          {/* Final CTA Section - will be made configurable later */}
          <section className="py-20 bg-primary text-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to Transform Your Skin?
              </h2>
              <p className="text-xl mb-8 text-white/90">
                Join thousands of satisfied customers and experience the difference
              </p>
              <button className="px-12 py-4 bg-white text-primary rounded-full hover:bg-accent hover:text-white transition-all font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105">
                Buy Now
              </button>
            </div>
          </section>
        </main>

        {/* Footer is always shown */}
        <Footer />
      </div>
    </ProductProvider>
  );
}
