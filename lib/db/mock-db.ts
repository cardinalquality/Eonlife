// Mock database implementation
// This simulates Prisma-like interface and can be replaced with real Prisma later

import { Product, Review, CartItem, FilterParams, SortParams } from './types';

// In-memory storage (in production, this would be a real database)
let products: Product[] = [];
let reviews: Review[] = [];
let cartItems: CartItem[] = [];

// Helper function to generate IDs
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Product operations
export const db = {
  products: {
    async findMany(options: {
      where?: Partial<Product> & FilterParams;
      orderBy?: Partial<Record<keyof Product, 'asc' | 'desc'>>;
      take?: number;
      skip?: number;
      include?: { reviews?: boolean };
    } = {}) {
      let filtered = [...products];

      // Apply filters
      if (options.where) {
        filtered = filtered.filter(product => {
          if (options.where?.isActive !== undefined && product.isActive !== options.where.isActive) {
            return false;
          }
          if (options.where?.category && product.category !== options.where.category) {
            return false;
          }
          if (options.where?.minPrice !== undefined && product.price < options.where.minPrice) {
            return false;
          }
          if (options.where?.maxPrice !== undefined && product.price > options.where.maxPrice) {
            return false;
          }
          if (options.where?.search) {
            const searchLower = options.where.search.toLowerCase();
            return (
              product.name.toLowerCase().includes(searchLower) ||
              product.description.toLowerCase().includes(searchLower) ||
              product.tags.some(tag => tag.toLowerCase().includes(searchLower))
            );
          }
          if (options.where?.tags && options.where.tags.length > 0) {
            return options.where.tags.some(tag => product.tags.includes(tag));
          }
          return true;
        });
      }

      // Apply sorting
      if (options.orderBy) {
        const [field, order] = Object.entries(options.orderBy)[0];
        filtered.sort((a, b) => {
          const aVal = a[field as keyof Product];
          const bVal = b[field as keyof Product];

          // Handle undefined values
          if (aVal === undefined && bVal === undefined) return 0;
          if (aVal === undefined) return 1;
          if (bVal === undefined) return -1;

          if (aVal < bVal) return order === 'asc' ? -1 : 1;
          if (aVal > bVal) return order === 'asc' ? 1 : -1;
          return 0;
        });
      }

      // Apply pagination
      if (options.skip) {
        filtered = filtered.slice(options.skip);
      }
      if (options.take) {
        filtered = filtered.slice(0, options.take);
      }

      // Include reviews if requested
      if (options.include?.reviews) {
        return filtered.map(product => ({
          ...product,
          reviews: reviews.filter(r => r.productId === product.id)
        }));
      }

      return filtered;
    },

    async findUnique(options: {
      where: { id: string };
      include?: { reviews?: boolean };
    }) {
      const product = products.find(p => p.id === options.where.id);
      if (!product) return null;

      if (options.include?.reviews) {
        return {
          ...product,
          reviews: reviews.filter(r => r.productId === product.id)
        };
      }

      return product;
    },

    async create(options: { data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> }) {
      const newProduct: Product = {
        ...options.data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      products.push(newProduct);
      return newProduct;
    },

    async update(options: {
      where: { id: string };
      data: Partial<Omit<Product, 'id' | 'createdAt'>>;
    }) {
      const index = products.findIndex(p => p.id === options.where.id);
      if (index === -1) throw new Error('Product not found');

      products[index] = {
        ...products[index],
        ...options.data,
        updatedAt: new Date(),
      };
      return products[index];
    },

    async delete(options: { where: { id: string } }) {
      const index = products.findIndex(p => p.id === options.where.id);
      if (index === -1) throw new Error('Product not found');

      const deleted = products[index];
      products.splice(index, 1);
      return deleted;
    },
  },

  reviews: {
    async findMany(options: { where?: Partial<Review>; orderBy?: any; take?: number } = {}) {
      let filtered = [...reviews];

      if (options.where) {
        filtered = filtered.filter(review => {
          return Object.entries(options.where!).every(
            ([key, value]) => review[key as keyof Review] === value
          );
        });
      }

      if (options.orderBy) {
        const [field, order] = Object.entries(options.orderBy)[0];
        filtered.sort((a, b) => {
          const aVal = a[field as keyof Review];
          const bVal = b[field as keyof Review];
          if (aVal < bVal) return order === 'asc' ? -1 : 1;
          if (aVal > bVal) return order === 'asc' ? 1 : -1;
          return 0;
        });
      }

      if (options.take) {
        filtered = filtered.slice(0, options.take);
      }

      return filtered;
    },

    async create(options: { data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'> }) {
      const newReview: Review = {
        ...options.data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      reviews.push(newReview);

      // Update product rating
      this.updateProductRating(newReview.productId);

      return newReview;
    },

    updateProductRating(productId: string) {
      const productReviews = reviews.filter(r => r.productId === productId);
      if (productReviews.length > 0) {
        const avgRating =
          productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        const productIndex = products.findIndex(p => p.id === productId);
        if (productIndex !== -1) {
          products[productIndex].averageRating = avgRating;
          products[productIndex].reviewCount = productReviews.length;
        }
      }
    },
  },

  cartItems: {
    async findMany(options: { where?: Partial<CartItem> } = {}) {
      let filtered = [...cartItems];

      if (options.where) {
        filtered = filtered.filter(item => {
          return Object.entries(options.where!).every(
            ([key, value]) => item[key as keyof CartItem] === value
          );
        });
      }

      return filtered;
    },

    async create(options: { data: Omit<CartItem, 'id' | 'createdAt' | 'updatedAt'> }) {
      const newItem: CartItem = {
        ...options.data,
        id: generateId(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      cartItems.push(newItem);
      return newItem;
    },

    async update(options: { where: { id: string }; data: Partial<CartItem> }) {
      const index = cartItems.findIndex(item => item.id === options.where.id);
      if (index === -1) throw new Error('Cart item not found');

      cartItems[index] = {
        ...cartItems[index],
        ...options.data,
        updatedAt: new Date(),
      };
      return cartItems[index];
    },

    async delete(options: { where: { id: string } }) {
      const index = cartItems.findIndex(item => item.id === options.where.id);
      if (index === -1) throw new Error('Cart item not found');

      const deleted = cartItems[index];
      cartItems.splice(index, 1);
      return deleted;
    },

    async deleteMany(options: { where: Partial<CartItem> }) {
      const initialLength = cartItems.length;
      cartItems = cartItems.filter(item => {
        return !Object.entries(options.where).every(
          ([key, value]) => item[key as keyof CartItem] === value
        );
      });
      return { count: initialLength - cartItems.length };
    },
  },

  // Transaction support (simplified)
  async $transaction(callback: any) {
    return callback({
      products: this.products,
      reviews: this.reviews,
      cartItems: this.cartItems,
    });
  },
};

// Export function to seed initial data
export function seedDatabase(seedProducts: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[]) {
  products = seedProducts.map(p => ({
    ...p,
    id: generateId(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

// Get current data (for debugging/testing)
export function getDatabaseState() {
  return { products, reviews, cartItems };
}
