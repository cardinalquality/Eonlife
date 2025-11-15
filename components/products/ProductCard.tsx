import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/db/types';
import StarRating from '../StarRating';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const isLowStock = product.inventoryQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.inventoryQuantity === 0;

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl">
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {hasDiscount && (
              <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                {discountPercentage}% OFF
              </span>
            )}
            {product.tags.includes('bestseller') && (
              <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-semibold">
                BESTSELLER
              </span>
            )}
            {isLowStock && !isOutOfStock && (
              <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                LOW STOCK
              </span>
            )}
            {isOutOfStock && (
              <span className="bg-gray-500 text-white px-2 py-1 rounded text-xs font-semibold">
                OUT OF STOCK
              </span>
            )}
          </div>
        </div>

        {/* Product Info */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {product.name}
          </h3>

          {/* Rating */}
          {product.reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-2">
              <StarRating rating={product.averageRating} size="sm" />
              <span className="text-sm text-gray-600">({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl font-bold text-gray-900">
              ${product.price.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-lg text-gray-500 line-through">
                ${product.compareAtPrice!.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description Preview */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {product.description}
          </p>

          {/* Category */}
          <span className="inline-block text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {product.category}
          </span>
        </div>
      </div>
    </Link>
  );
}
