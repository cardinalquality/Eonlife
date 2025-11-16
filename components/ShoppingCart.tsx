'use client';

import { useCart } from '@/lib/cart-context';
import Link from 'next/link';
import { useState } from 'react';

export default function ShoppingCart() {
  const { cart, updateQuantity, removeFromCart, calculateSubtotal, getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const subtotal = calculateSubtotal();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + tax + shipping;

  return (
    <>
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-gray-700 hover:text-primary transition-colors"
        aria-label="Shopping cart"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
        {getItemCount() > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {getItemCount()}
          </span>
        )}
      </button>

      {/* Cart Sidebar */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                Shopping Cart ({getItemCount()})
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close cart"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg
                    className="w-24 h-24 text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add some products to get started!
                  </p>
                  <Link
                    href="/products"
                    onClick={() => setIsOpen(false)}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-accent transition-colors"
                  >
                    Shop Products
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.productId}
                      className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                    >
                      {/* Product Image Placeholder */}
                      <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={() => setIsOpen(false)}
                          className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2"
                        >
                          {item.name}
                        </Link>
                        <p className="text-sm text-gray-600 mt-1">
                          ${item.price.toFixed(2)} each
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded transition-colors"
                            aria-label="Increase quantity"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => removeFromCart(item.productId)}
                            className="ml-auto text-red-500 hover:text-red-700 transition-colors"
                            aria-label="Remove item"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>

                        {/* Item Total */}
                        <p className="text-lg font-bold text-gray-900 mt-2">
                          ${(item.price * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with Totals */}
            {cart.length > 0 && (
              <div className="border-t p-6 space-y-4">
                {/* Subtotal */}
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                {/* Tax */}
                <div className="flex justify-between text-gray-700">
                  <span>Tax (8%):</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between text-gray-700">
                  <span>Shipping:</span>
                  <span className="font-semibold">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                {shipping > 0 && subtotal < 100 && (
                  <p className="text-sm text-orange-600">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                  </p>
                )}

                {/* Total */}
                <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/cart"
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 px-6 bg-primary text-white text-center rounded-lg font-semibold hover:bg-accent transition-colors"
                >
                  View Cart & Checkout
                </Link>

                <button
                  onClick={() => setIsOpen(false)}
                  className="block w-full py-3 px-6 bg-gray-200 text-gray-800 text-center rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
