import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup after each test case
afterEach(() => {
  cleanup();
});

// Mock environment variables
process.env.STRIPE_SECRET_KEY = 'sk_test_mock_key';
process.env.STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock_secret';
process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_mock_key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

// Mock Prisma client
vi.mock('@/lib/db/client', () => ({
  prisma: {
    customer: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    orderItem: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    product: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    subscription: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
    },
    paymentMethod: {
      create: vi.fn(),
      findMany: vi.fn(),
      delete: vi.fn(),
    },
    paymentEvent: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));
