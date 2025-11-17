import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST, OPTIONS } from '@/app/api/contact/route';
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
    contact: {
      parse: vi.fn(),
    },
  },
}));

vi.mock('@/lib/sanitization', () => ({
  sanitizeUserContent: vi.fn((content) => content),
}));

import { validateRequestBody } from '@/lib/api-middleware';

describe('POST /api/contact', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully submit contact form', async () => {
    const mockContactData = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      message: 'Test message',
    };

    (validateRequestBody as any).mockResolvedValue({
      success: true,
      data: mockContactData,
    });

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify(mockContactData),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.success).toBe(true);
    expect(data.message).toContain('sent successfully');
  });

  it('should reject invalid contact data', async () => {
    (validateRequestBody as any).mockResolvedValue({
      success: false,
      error: new Response(
        JSON.stringify({ error: 'Validation failed' }),
        { status: 400 }
      ),
    });

    const request = new NextRequest('http://localhost:3000/api/contact', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Validation failed');
  });
});

describe('OPTIONS /api/contact', () => {
  it('should return correct CORS headers with CSRF support', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-CSRF-Token');
  });
});
