// Product registry for loading and managing products

import { ProductConfig } from './types/product';
import { appConfig } from '@/config/app.config';

// Import all product configurations
const productConfigs: Record<string, () => Promise<ProductConfig>> = {
  reluma: async () => (await import('@/products/reluma/product.config')).relumaProduct,
  'longevity-formula': async () => (await import('@/products/longevity-formula/product.config')).longevityFormulaProduct,
};

/**
 * Get the active product configuration
 */
export async function getActiveProduct(): Promise<ProductConfig> {
  const productId = appConfig.activeProduct;
  const productLoader = productConfigs[productId];

  if (!productLoader) {
    throw new Error(
      `Product "${productId}" not found. Available products: ${Object.keys(productConfigs).join(', ')}`
    );
  }

  return await productLoader();
}

/**
 * Get a specific product configuration by ID
 */
export async function getProduct(productId: string): Promise<ProductConfig> {
  const productLoader = productConfigs[productId];

  if (!productLoader) {
    throw new Error(
      `Product "${productId}" not found. Available products: ${Object.keys(productConfigs).join(', ')}`
    );
  }

  return await productLoader();
}

/**
 * Get all available product IDs
 */
export function getAvailableProducts(): string[] {
  return Object.keys(productConfigs);
}

/**
 * Register a new product
 */
export function registerProduct(productId: string, loader: () => Promise<ProductConfig>) {
  productConfigs[productId] = loader;
}
