import { notFound } from 'next/navigation';
import { db } from '@/lib/db/mock-db';
import { initializeDatabase } from '@/lib/db/seed';
import ProductImageGallery from '@/components/products/ProductImageGallery';
import AddToCartButton from '@/components/products/AddToCartButton';
import ProductReviews from '@/components/products/ProductReviews';
import RelatedProducts from '@/components/products/RelatedProducts';
import StarRating from '@/components/StarRating';
import Link from 'next/link';
import type { Product, Review } from '@/lib/db/types';

// Initialize database
initializeDatabase();

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

type ProductWithReviews = Product & { reviews: Review[] };

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await db.products.findUnique({
    where: { id },
    include: { reviews: true },
  }) as ProductWithReviews | null;

  if (!product) {
    notFound();
  }

  // Get related products from the same category
  const relatedProducts = await db.products.findMany({
    where: {
      category: product.category,
      isActive: true,
    },
    take: 20,
  });

  // Filter out current product and limit to 4
  const filteredRelated = relatedProducts
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const isLowStock = product.inventoryQuantity <= product.lowStockThreshold;
  const isOutOfStock = product.inventoryQuantity === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-primary transition-colors">
            Products
          </Link>
          <span>/</span>
          <Link
            href={`/products?category=${product.category}`}
            className="hover:text-primary transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div>
              <ProductImageGallery images={product.images} productName={product.name} />
            </div>

            {/* Product Info */}
            <div>
              {/* Category & SKU */}
              <div className="flex items-center gap-3 mb-3">
                <Link
                  href={`/products?category=${product.category}`}
                  className="text-sm text-primary hover:text-accent font-medium transition-colors"
                >
                  {product.category}
                </Link>
                <span className="text-sm text-gray-500">SKU: {product.sku}</span>
              </div>

              {/* Product Name */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Rating */}
              {product.reviewCount > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <StarRating rating={product.averageRating} size="lg" showNumber />
                  <a
                    href="#reviews"
                    className="text-sm text-gray-600 hover:text-primary transition-colors"
                  >
                    ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                  </a>
                </div>
              )}

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${product.price.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-2xl text-gray-500 line-through">
                        ${product.compareAtPrice!.toFixed(2)}
                      </span>
                      <span className="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold">
                        Save {discountPercentage}%
                      </span>
                    </>
                  )}
                </div>
                <p className="text-sm text-gray-600">Free shipping on orders over $100</p>
              </div>

              {/* Description */}
              <div className="mb-6 pb-6 border-b">
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Inventory Status */}
              {isLowStock && !isOutOfStock && (
                <div className="bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-lg mb-6 flex items-start gap-3">
                  <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold">Low Stock Alert!</p>
                    <p className="text-sm">Only {product.inventoryQuantity} left in stock. Order soon!</p>
                  </div>
                </div>
              )}

              {isOutOfStock && (
                <div className="bg-gray-100 border border-gray-300 text-gray-800 px-4 py-3 rounded-lg mb-6 text-center">
                  <p className="font-semibold">Currently Out of Stock</p>
                  <p className="text-sm">Check back soon or browse similar products below</p>
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/products?search=${tag}`}
                        className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              {!isOutOfStock && <AddToCartButton product={product} />}

              {/* Additional Info */}
              <div className="mt-8 pt-8 border-t space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                    <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                  </svg>
                  <span>Free shipping on orders over $100</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>100% authentic guarantee</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <RelatedProducts products={filteredRelated} />
        </div>

        {/* Reviews */}
        <div id="reviews" className="bg-white rounded-lg shadow-md p-8">
          <ProductReviews
            reviews={product.reviews || []}
            productId={product.id}
            averageRating={product.averageRating}
            reviewCount={product.reviewCount}
          />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await db.products.findUnique({ where: { id } });

  if (!product) {
    return {
      title: 'Product Not Found',
    };
  }

  return {
    title: `${product.name} | ReLuma`,
    description: product.description,
  };
}
