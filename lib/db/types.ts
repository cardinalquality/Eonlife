// Database types for e-commerce system

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  category: string;
  images: string[];
  inventoryQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
  sku: string;
  tags: string[];
}

export interface Review {
  id: string;
  productId: string;
  authorName: string;
  rating: number;
  title: string;
  content: string;
  verified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  userId?: string;
  sessionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  tags?: string[];
}

export interface SortParams {
  field: 'price' | 'createdAt' | 'name' | 'rating';
  order: 'asc' | 'desc';
}
