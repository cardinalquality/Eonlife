'use client';

import { useProduct } from '@/lib/product-context';

export default function TestimonialsSection() {
  const { currentVariant } = useProduct();
  const { section5 } = currentVariant.content;

  if (!section5 || !section5.testimonials) {
    return null;
  }

  return (
    <section id="testimonials" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {section5.title}
          </h2>
          <div className="w-24 h-1 bg-primary mx-auto"></div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {section5.testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
            >
              {/* Star rating */}
              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 text-accent"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              )}

              {/* Quote */}
              <blockquote className="text-gray-700 italic mb-6 text-lg">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold text-lg">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <div className="font-bold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">Verified Customer</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
