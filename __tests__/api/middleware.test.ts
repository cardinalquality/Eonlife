import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createApiResponse,
  createErrorResponse,
  requireMethod,
  getCorsHeaders,
} from '@/lib/api-middleware';

describe('API Middleware Helpers', () => {
  describe('createApiResponse', () => {
    it('should create a successful API response', () => {
      const data = { message: 'Success', data: [1, 2, 3] };
      const response = createApiResponse(data, 200);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
    });

    it('should include additional headers when provided', () => {
      const data = { message: 'Created' };
      const response = createApiResponse(data, 201, {
        'X-Custom-Header': 'custom-value',
      });

      expect(response.status).toBe(201);
      expect(response.headers.get('X-Custom-Header')).toBe('custom-value');
    });

    it('should default to status 200', () => {
      const data = { message: 'OK' };
      const response = createApiResponse(data);

      expect(response.status).toBe(200);
    });
  });

  describe('createErrorResponse', () => {
    it('should create an error response', () => {
      const response = createErrorResponse('Something went wrong', 400);

      expect(response.status).toBe(400);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });

    it('should include error details when provided', async () => {
      const details = { field: 'email', message: 'Invalid format' };
      const response = createErrorResponse('Validation error', 400, details);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Validation error');
      expect(data.details).toEqual(details);
    });

    it('should default to status 500', async () => {
      const response = createErrorResponse('Server error');
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Server error');
    });
  });

  describe('requireMethod', () => {
    it('should allow permitted methods', () => {
      const request = new Request('http://localhost:3000/api/test', {
        method: 'POST',
      });

      const response = requireMethod(request, ['POST', 'GET']);

      expect(response).toBeNull();
    });

    it('should reject non-permitted methods', async () => {
      const request = new Request('http://localhost:3000/api/test', {
        method: 'DELETE',
      });

      const response = requireMethod(request, ['POST', 'GET']);

      expect(response).not.toBeNull();
      expect(response!.status).toBe(405);
      expect(response!.headers.get('Allow')).toBe('POST, GET');

      const data = await response!.json();
      expect(data.error).toBe('Method not allowed');
    });

    it('should include allowed methods in error response', async () => {
      const request = new Request('http://localhost:3000/api/test', {
        method: 'PUT',
      });

      const response = requireMethod(request, ['GET']);
      const data = await response!.json();

      expect(data.allowed).toEqual(['GET']);
    });
  });

  describe('getCorsHeaders', () => {
    it('should return default CORS headers', () => {
      const headers = getCorsHeaders();

      expect(headers['Access-Control-Allow-Origin']).toBe('*');
      expect(headers['Access-Control-Allow-Methods']).toContain('GET');
      expect(headers['Access-Control-Allow-Methods']).toContain('POST');
      expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
      expect(headers['Access-Control-Max-Age']).toBe('86400');
    });

    it('should use custom origin when provided', () => {
      const headers = getCorsHeaders('https://example.com');

      expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
    });

    it('should use first origin from array', () => {
      const headers = getCorsHeaders(['https://example.com', 'https://test.com']);

      expect(headers['Access-Control-Allow-Origin']).toBe('https://example.com');
    });

    it('should use custom methods when provided', () => {
      const headers = getCorsHeaders(undefined, ['GET', 'POST']);

      expect(headers['Access-Control-Allow-Methods']).toBe('GET, POST');
    });

    it('should include CSRF token header in allowed headers', () => {
      const headers = getCorsHeaders();

      expect(headers['Access-Control-Allow-Headers']).toContain('X-CSRF-Token');
    });
  });
});
