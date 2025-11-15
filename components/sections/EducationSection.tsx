'use client';

import { useTemplate } from '@/lib/template-context';
import Image from 'next/image';

export default function EducationSection() {
  const { currentTemplate } = useTemplate();
  const { section2 } = currentTemplate.content;

  return (
    <section id="education" className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Image */}
          <div className="relative h-[400px] md:h-[500px]">
            {currentTemplate.assets.sections.section2?.images?.[0] && (
              <Image
                src={currentTemplate.assets.sections.section2.images[0]}
                alt="ReLuma Products"
                fill
                className="object-contain"
              />
            )}
          </div>

          {/* Right - Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              {section2.title}
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              {section2.description}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary">387</div>
                <div className="text-sm text-gray-600 mt-1">Growth Factors</div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary">&lt;9</div>
                <div className="text-sm text-gray-600 mt-1">Competitors</div>
              </div>
            </div>

            <button className="mt-6 px-8 py-3 bg-primary text-white rounded-full hover:bg-accent transition-all font-semibold shadow-md hover:shadow-lg">
              {section2.ctaText}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
