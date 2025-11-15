/**
 * CSRF Token Generation API Route
 * Provides CSRF tokens for client-side forms
 */

import { NextRequest } from 'next/server';
import { createCsrfSession } from '@/lib/csrf';
import { createApiResponse } from '@/lib/api-middleware';

export async function GET(req: NextRequest) {
  // Get client identifier (IP or session ID)
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded?.split(',')[0] || 'unknown';
  const identifier = `ip:${ip}`;

  // Generate CSRF token and cookie
  const { token, cookie } = createCsrfSession(identifier);

  return new Response(
    JSON.stringify({
      csrfToken: token
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookie
      }
    }
  );
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
