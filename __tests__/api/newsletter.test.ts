import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, OPTIONS } from '@/app/api/newsletter/route';
import { NextRequest } from 'next/server';

// Mock the middleware and validation
vi.mock('@/lib/api-middleware', () => ({
  withSecurity: vi.fn((req, handler, config) => handler(req)),
  validateRequestBody: vi.fn(),
  createApiResponse: vi.fn((data, status) => {
    return new Response(JSON.stringify(data), {
      status,
      headers: { 'Content-Type': 'application/json' }
    });
  }),
}));

vi.mock('@/lib/validation', () => ({
  formSchemas: {
    newsletter: {
      parse: vi.fn(),
    },
  },
}));

vi.mock('@/lib/sanitization', () => ({
  sanitizeEmail: vi.fn((email) => email.toLowerCase().trim()),
}));

import { validateRequestBody } from '@/lib/api-middleware';

describe('POST /api/newsletter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully subscribe to newsletter', async () => {
    const mockEmail = 'test@example.com';

    (validateRequestBody as any).mockResolvedValue({
      success: true,
      data: { email: mockEmail },
    });

    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: mockEmail }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Successfully subscribed to newsletter');
    expect(data.email).toBe(mockEmail);
  });

  it('should reject invalid email format', async () => {
    (validateRequestBody as any).mockResolvedValue({
      success: false,
      error: new Response(
        JSON.stringify({ error: 'Validation failed' }),
        { status: 400 }
      ),
    });

    const request = new NextRequest('http://localhost:3000/api/newsletter', {
      method: 'POST',
      body: JSON.stringify({ email: 'invalid-email' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});

describe('OPTIONS /api/newsletter', () => {
  it('should return correct CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  });
});
