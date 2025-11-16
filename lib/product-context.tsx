'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProductConfig, VariantConfig } from './types/product';

interface ProductContextType {
  currentProduct: ProductConfig;
  currentVariant: VariantConfig;
  setVariant: (variantId: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  product: ProductConfig;
  initialVariant?: string;
  children: ReactNode;
}

export function ProductProvider({ product, initialVariant, children }: ProductProviderProps) {
  const [activeVariantId, setActiveVariantId] = useState(
    initialVariant || Object.keys(product.variants)[0]
  );

  const currentVariant = product.variants[activeVariantId];

  const setVariant = (variantId: string) => {
    if (product.variants[variantId]) {
      setActiveVariantId(variantId);
    } else {
      console.warn(`Variant "${variantId}" not found in product "${product.id}"`);
    }
  };

  return (
    <ProductContext.Provider
      value={{
        currentProduct: product,
        currentVariant,
        setVariant,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProduct must be used within a ProductProvider');
  }
  return context;
}
