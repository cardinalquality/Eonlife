'use client';

import { useTemplate } from '@/lib/template-context';

export default function ScienceSection() {
  const { currentTemplate } = useTemplate();
  const { section7 } = currentTemplate.content;

  return (
    <section id="science" className="py-20 bg-gradient-to-br from-secondary to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left - Content */}
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground">
              {section7.title}
            </h2>
            <div className="w-24 h-1 bg-primary"></div>
            <p className="text-lg text-gray-700 leading-relaxed">
              {section7.content}
            </p>

            <div className="grid grid-cols-2 gap-4 pt-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-2">🧬</div>
                <div className="font-bold text-foreground">Cellular Repair</div>
                <div className="text-sm text-gray-600 mt-1">
                  Works at the cellular level
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-2">🔬</div>
                <div className="font-bold text-foreground">Science-Backed</div>
                <div className="text-sm text-gray-600 mt-1">
                  Clinically proven results
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-2">🌿</div>
                <div className="font-bold text-foreground">Natural</div>
                <div className="text-sm text-gray-600 mt-1">
                  Ethically sourced
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="text-4xl mb-2">✨</div>
                <div className="font-bold text-foreground">Effective</div>
                <div className="text-sm text-gray-600 mt-1">
                  Visible in 4 weeks
                </div>
              </div>
            </div>

            <button className="mt-6 px-8 py-3 bg-primary text-white rounded-full hover:bg-accent transition-all font-semibold shadow-md hover:shadow-lg">
              {section7.ctaText}
            </button>
          </div>

          {/* Right - Visual/Stats */}
          <div className="bg-white p-12 rounded-2xl shadow-xl">
            <div className="text-center mb-8">
              <div className="text-7xl font-bold text-primary mb-2">387</div>
              <div className="text-2xl text-gray-600">Human Growth Factors</div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Wrinkle Reduction</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <span className="font-bold text-primary">95%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Skin Firmness</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
                <span className="font-bold text-primary">92%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Hydration</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <span className="font-bold text-primary">98%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Skin Tone</span>
                <div className="flex-1 mx-4 bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '90%' }}></div>
                </div>
                <span className="font-bold text-primary">90%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
