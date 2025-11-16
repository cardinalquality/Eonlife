// Section registry for dynamic section rendering

import { ComponentType } from 'react';
import { SectionType } from './types/product';

// Import all section components
import Header from '@/components/sections/Header';
import HeroSection from '@/components/sections/HeroSection';
import EducationSection from '@/components/sections/EducationSection';
import FeaturesSection from '@/components/sections/FeaturesSection';
import TestimonialsSection from '@/components/sections/TestimonialsSection';
import ScienceSection from '@/components/sections/ScienceSection';
import BeforeAfterSection from '@/components/sections/BeforeAfterSection';
import Footer from '@/components/sections/Footer';

export interface SectionComponent {
  component: ComponentType;
  name: string;
  description?: string;
}

// Section registry mapping section types to components
const sectionRegistry: Record<string, SectionComponent> = {
  header: {
    component: Header,
    name: 'Header',
    description: 'Navigation header with logo and menu',
  },
  hero: {
    component: HeroSection,
    name: 'Hero',
    description: 'Basic hero section',
  },
  'hero-with-form': {
    component: HeroSection,
    name: 'Hero with Form',
    description: 'Hero section with lead capture form',
  },
  'hero-video': {
    component: HeroSection,
    name: 'Hero with Video',
    description: 'Hero section with video background (uses same component)',
  },
  education: {
    component: EducationSection,
    name: 'Education',
    description: 'Product education and information section',
  },
  features: {
    component: FeaturesSection,
    name: 'Features',
    description: 'Product features showcase',
  },
  'features-grid': {
    component: FeaturesSection,
    name: 'Features Grid',
    description: 'Features in grid layout',
  },
  testimonials: {
    component: TestimonialsSection,
    name: 'Testimonials',
    description: 'Customer testimonials and reviews',
  },
  science: {
    component: ScienceSection,
    name: 'Science',
    description: 'Scientific information and credibility',
  },
  'before-after': {
    component: BeforeAfterSection,
    name: 'Before/After',
    description: 'Before and after comparison slider',
  },
  benefits: {
    component: FeaturesSection,
    name: 'Benefits',
    description: 'Product benefits (uses features component)',
  },
  ingredients: {
    component: EducationSection,
    name: 'Ingredients',
    description: 'Product ingredients information (uses education component)',
  },
  faq: {
    component: EducationSection,
    name: 'FAQ',
    description: 'Frequently asked questions (placeholder)',
  },
  pricing: {
    component: EducationSection,
    name: 'Pricing',
    description: 'Pricing information (placeholder)',
  },
  'pricing-table': {
    component: EducationSection,
    name: 'Pricing Table',
    description: 'Pricing table with options (placeholder)',
  },
  cta: {
    component: EducationSection,
    name: 'CTA',
    description: 'Call to action section (placeholder)',
  },
  footer: {
    component: Footer,
    name: 'Footer',
    description: 'Site footer with links and social media',
  },
};

/**
 * Get a section component by type
 */
export function getSectionComponent(sectionType: SectionType | string): ComponentType | null {
  const section = sectionRegistry[sectionType];
  return section ? section.component : null;
}

/**
 * Get all registered section types
 */
export function getAvailableSections(): string[] {
  return Object.keys(sectionRegistry);
}

/**
 * Register a new section type
 */
export function registerSection(
  sectionType: string,
  component: ComponentType,
  name: string,
  description?: string
) {
  sectionRegistry[sectionType] = {
    component,
    name,
    description,
  };
}

/**
 * Get section metadata
 */
export function getSectionMetadata(sectionType: string): Omit<SectionComponent, 'component'> | null {
  const section = sectionRegistry[sectionType];
  if (!section) return null;

  return {
    name: section.name,
    description: section.description,
  };
}
