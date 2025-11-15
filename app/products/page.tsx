import { db } from '@/lib/db/mock-db';
import { initializeDatabase } from '@/lib/db/seed';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';

// Initialize database with seed data
initializeDatabase();

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams;
  const { category, sort, minPrice, maxPrice, search } = params;

  // Parse sort parameter
  const [sortField, sortOrder] = (sort || 'createdAt-desc').split('-') as [
    'price' | 'createdAt' | 'name' | 'rating',
    'asc' | 'desc'
  ];

  // Fetch products with filters
  const products = await db.products.findMany({
    where: {
      isActive: true,
      category: category || undefined,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      search: search || undefined,
    },
    orderBy: {
      [sortField]: sortOrder,
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Our Products</h1>
          <p className="text-lg text-gray-600">
            Discover our complete collection of luxury skincare products
          </p>
        </div>

        {/* Filters */}
        <ProductFilters />

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{products.length}</span> product
            {products.length !== 1 ? 's' : ''}
            {category && category !== 'All' && (
              <span> in <span className="font-semibold">{category}</span></span>
            )}
            {search && (
              <span> matching <span className="font-semibold">&quot;{search}&quot;</span></span>
            )}
          </p>
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <svg
              className="mx-auto h-24 w-24 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No products found</h3>
            <p className="mt-2 text-gray-500">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export const metadata = {
  title: 'Products | ReLuma',
  description: 'Browse our complete collection of luxury skincare products',
};
