'use client';

import { useState } from 'react';
import { useCart } from '@/lib/cart-context';
import type { Product } from '@/lib/db/types';

interface AddToCartButtonProps {
  product: Product;
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleAddToCart = async () => {
    if (quantity < 1 || quantity > product.inventoryQuantity) {
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(product, quantity);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <label htmlFor="quantity" className="text-sm font-medium text-gray-700">
          Quantity:
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={quantity <= 1}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <input
            type="number"
            id="quantity"
            value={quantity}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 1;
              setQuantity(Math.min(Math.max(1, val), product.inventoryQuantity));
            }}
            min="1"
            max={product.inventoryQuantity}
            className="w-16 text-center py-2 border-x border-gray-300 focus:outline-none"
          />
          <button
            onClick={() => setQuantity(Math.min(product.inventoryQuantity, quantity + 1))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 transition-colors"
            disabled={quantity >= product.inventoryQuantity}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <span className="text-sm text-gray-600">
          ({product.inventoryQuantity} available)
        </span>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding || product.inventoryQuantity === 0}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
          showSuccess
            ? 'bg-green-500 hover:bg-green-600'
            : 'bg-primary hover:bg-accent'
        } disabled:bg-gray-400 disabled:cursor-not-allowed`}
      >
        {isAdding ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Adding...
          </span>
        ) : showSuccess ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Added to Cart!
          </span>
        ) : (
          'Add to Cart'
        )}
      </button>
    </div>
  );
}
