'use client';

/**
 * CheckoutForm Component
 *
 * This component handles payment collection using Stripe Elements.
 * It calls our payment service API (not Stripe directly).
 * Later, we can swap Stripe for PayPal/Paddle by changing this component and the API.
 */

import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface CheckoutFormProps {
  amount: number; // in cents
  description: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

function CheckoutFormContent({ amount, description, onSuccess, onError }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [email, setEmail] = useState('');
  const [customerId, setCustomerId] = useState('');

  // Step 1: Create or get customer
  const handleCreateCustomer = async () => {
    if (!email) {
      setErrorMessage('Email is required');
      return false;
    }

    try {
      const response = await fetch('/api/customers/create-or-get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const data = await response.json();
      setCustomerId(data.customer.id);
      return true;
    } catch (error) {
      setErrorMessage((error as Error).message);
      onError?.((error as Error).message);
      return false;
    }
  };

  // Step 2: Create payment intent
  const handleCreatePaymentIntent = async () => {
    if (!customerId) {
      return null;
    }

    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId,
          amount,
          currency: 'usd',
          description,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const data = await response.json();
      return data.paymentIntent;
    } catch (error) {
      setErrorMessage((error as Error).message);
      onError?.((error as Error).message);
      return null;
    }
  };

  // Step 3: Confirm payment
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Create customer if not already created
      if (!customerId) {
        const customerCreated = await handleCreateCustomer();
        if (!customerCreated) {
          setIsLoading(false);
          return;
        }
      }

      // Create payment intent
      const paymentIntent = await handleCreatePaymentIntent();
      if (!paymentIntent) {
        setIsLoading(false);
        return;
      }

      // Confirm payment with card element
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error, paymentIntent: confirmedIntent } = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email,
            },
          },
        }
      );

      if (error) {
        setErrorMessage(error.message || 'Payment failed');
        onError?.(error.message || 'Payment failed');
      } else if (confirmedIntent?.status === 'succeeded') {
        onSuccess?.(confirmedIntent.id);
      }
    } catch (error) {
      const message = (error as Error).message;
      setErrorMessage(message);
      onError?.(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="card" className="block text-sm font-medium text-gray-700">
          Card Details
        </label>
        <div className="mt-1 rounded-md border border-gray-300 p-3">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424242',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                },
              },
            }}
          />
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{errorMessage}</p>
        </div>
      )}

      <div className="text-sm text-gray-600">
        Total: ${(amount / 100).toFixed(2)}
      </div>

      <button
        type="submit"
        disabled={isLoading || !stripe}
        className="w-full rounded-md bg-blue-600 py-2 px-4 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : 'Pay Now'}
      </button>

      {/* Test card info */}
      <div className="rounded-md bg-blue-50 p-3 text-xs text-blue-900">
        <p className="font-semibold">Test cards:</p>
        <p>✓ Success: 4242 4242 4242 4242</p>
        <p>✗ Decline: 4000 0000 0000 0002</p>
        <p>3D Secure: 4000 0027 6000 3184</p>
      </div>
    </form>
  );
}

export function CheckoutForm(props: CheckoutFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutFormContent {...props} />
    </Elements>
  );
}

export default CheckoutForm;
