'use client';

/**
 * StripeCheckout Component
 *
 * This component initiates a Stripe Checkout session (hosted checkout).
 * It calls our payment API endpoint (not Stripe directly).
 * The abstraction makes it easy to swap payment providers.
 *
 * Benefits:
 * - Simpler than Stripe Elements for users
 * - Handles payment method switching
 * - Supports Apple Pay, Google Pay, etc.
 */

import React, { useState } from 'react';

interface CheckoutItem {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number; // in cents
}

interface StripeCheckoutProps {
  email?: string;
  customerId?: string;
  items: CheckoutItem[];
  onSuccess?: (sessionId: string) => void;
  onError?: (error: string) => void;
  buttonText?: string;
  className?: string;
}

export function StripeCheckout({
  email,
  customerId,
  items,
  onSuccess,
  onError,
  buttonText = 'Checkout',
  className,
}: StripeCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCheckout = async () => {
    if (!customerId && !email) {
      const errorMsg = 'Either email or customerId is required';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/payments/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          email,
          items,
          currency: 'usd',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const data = await response.json();

      if (data.session.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.session.url;
        onSuccess?.(data.session.id);
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      const message = (error as Error).message;
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  return (
    <div className="space-y-4">
      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      {items.length > 0 && (
        <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
          <div className="space-y-2">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm text-gray-700">
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>${((item.unitPrice * item.quantity) / 100).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between font-semibold text-gray-900">
              <span>Total:</span>
              <span>${(totalAmount / 100).toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className={
          className ||
          'w-full rounded-md bg-blue-600 py-3 px-4 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors'
        }
      >
        {isLoading ? 'Redirecting to Checkout...' : buttonText}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Secure checkout powered by Stripe
      </p>
    </div>
  );
}

export default StripeCheckout;
