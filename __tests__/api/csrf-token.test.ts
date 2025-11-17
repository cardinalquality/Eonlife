import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, OPTIONS } from '@/app/api/csrf-token/route';
import { NextRequest } from 'next/server';

// Mock CSRF utilities
vi.mock('@/lib/csrf', () => ({
  createCsrfSession: vi.fn(() => ({
    token: 'test-csrf-token-123',
    cookie: 'csrf_token=test-cookie-value; HttpOnly; Secure; SameSite=Strict',
  })),
}));

import { createCsrfSession } from '@/lib/csrf';

describe('GET /api/csrf-token', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate and return a CSRF token', async () => {
    const request = new NextRequest('http://localhost:3000/api/csrf-token', {
      headers: {
        'x-forwarded-for': '192.168.1.1',
      },
    });

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.csrfToken).toBe('test-csrf-token-123');
    expect(createCsrfSession).toHaveBeenCalledWith('ip:192.168.1.1');
  });

  it('should handle requests without x-forwarded-for header', async () => {
    const request = new NextRequest('http://localhost:3000/api/csrf-token');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.csrfToken).toBeTruthy();
    expect(createCsrfSession).toHaveBeenCalledWith('ip:unknown');
  });

  it('should parse multiple IPs from x-forwarded-for', async () => {
    const request = new NextRequest('http://localhost:3000/api/csrf-token', {
      headers: {
        'x-forwarded-for': '192.168.1.1, 10.0.0.1, 172.16.0.1',
      },
    });

    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(createCsrfSession).toHaveBeenCalledWith('ip:192.168.1.1');
  });
});

describe('OPTIONS /api/csrf-token', () => {
  it('should return correct CORS headers', async () => {
    const response = await OPTIONS();

    expect(response.status).toBe(204);
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
    expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, OPTIONS');
    expect(response.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type');
  });
});
