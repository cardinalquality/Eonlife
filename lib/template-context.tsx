'use client';

import React, { createContext, useContext, useState } from 'react';
import { TemplateConfig, TemplateVariant } from './types/template';
import { option1Config } from '@/templates/option1/config';
import { option2Config } from '@/templates/option2/config';

interface TemplateContextType {
  currentTemplate: TemplateConfig;
  variant: TemplateVariant;
  setVariant: (variant: TemplateVariant) => void;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

// Template registry - add new templates here
const templates: Record<TemplateVariant, TemplateConfig> = {
  option1: option1Config,
  option2: option2Config,
};

export function TemplateProvider({
  children,
  initialVariant = 'option1'
}: {
  children: React.ReactNode;
  initialVariant?: TemplateVariant;
}) {
  const [variant, setVariant] = useState<TemplateVariant>(initialVariant);
  const currentTemplate = templates[variant];

  return (
    <TemplateContext.Provider value={{ currentTemplate, variant, setVariant }}>
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplate() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
}
