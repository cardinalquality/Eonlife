/**
 * Newsletter Signup API Route
 * Demonstrates: Rate limiting, input validation, and sanitization
 */

import { NextRequest } from 'next/server';
import { withSecurity, validateRequestBody, createApiResponse, createErrorResponse } from '@/lib/api-middleware';
import { formSchemas } from '@/lib/validation';
import { sanitizeEmail } from '@/lib/sanitization';

export async function POST(req: NextRequest) {
  return withSecurity(
    req,
    async (request) => {
      // Validate request body
      const validation = await validateRequestBody(request, formSchemas.newsletter);

      if (!validation.success) {
        return validation.error;
      }

      const { email } = validation.data;

      // Additional sanitization
      const sanitizedEmail = sanitizeEmail(email);

      // TODO: Add email to your newsletter service (Mailchimp, SendGrid, etc.)
      console.log('Newsletter signup:', sanitizedEmail);

      // Simulate async operation
      await new Promise(resolve => setTimeout(resolve, 100));

      return createApiResponse({
        success: true,
        message: 'Successfully subscribed to newsletter',
        email: sanitizedEmail
      }, 201);
    },
    {
      allowedMethods: ['POST'],
      rateLimit: {
        enabled: true,
        type: 'email'
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400'
    }
  });
}
