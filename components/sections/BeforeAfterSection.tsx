'use client';

import { useState } from 'react';
import { useTemplate } from '@/lib/template-context';
import Image from 'next/image';

export default function BeforeAfterSection() {
  const { currentTemplate } = useTemplate();
  const { section8 } = currentTemplate.content;
  const [sliderPosition, setSliderPosition] = useState(50);

  return (
    <section id="results" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {section8.title}
          </h2>
          <p className="text-xl text-gray-600">{section8.description}</p>
          <div className="w-24 h-1 bg-primary mx-auto mt-4"></div>
        </div>

        {/* Before/After Slider */}
        <div className="max-w-3xl mx-auto">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
            {/* Before Image */}
            <div className="absolute inset-0">
              <Image
                src={section8.beforeImage}
                alt="Before using ReLuma"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-full font-semibold">
                Before
              </div>
            </div>

            {/* After Image */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image
                src={section8.afterImage}
                alt="After using ReLuma"
                fill
                className="object-cover"
              />
              <div className="absolute top-4 right-4 bg-primary text-white px-4 py-2 rounded-full font-semibold">
                After
              </div>
            </div>

            {/* Slider */}
            <div className="absolute inset-0 flex items-center">
              <div
                className="absolute top-0 bottom-0 w-1 bg-white shadow-lg"
                style={{ left: `${sliderPosition}%` }}
              >
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center cursor-grab active:cursor-grabbing">
                  <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Slider Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPosition}
              onChange={(e) => setSliderPosition(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-grab active:cursor-grabbing"
            />
          </div>

          <div className="mt-12 text-center">
            <p className="text-lg text-gray-700 mb-6">
              Real results from real customers. See the transformative power of 387 growth factors.
            </p>
            <button className="px-8 py-4 bg-primary text-white rounded-full hover:bg-accent transition-all font-semibold text-lg shadow-md hover:shadow-lg">
              Get Your ReLuma Today
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
