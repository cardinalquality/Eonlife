/**
 * Contact Form API Route
 * Demonstrates: Rate limiting, CSRF protection, input validation, and sanitization
 */

import { NextRequest } from 'next/server';
import { withSecurity, validateRequestBody, createApiResponse, createErrorResponse } from '@/lib/api-middleware';
import { formSchemas } from '@/lib/validation';
import { sanitizeUserContent } from '@/lib/sanitization';

export async function POST(req: NextRequest) {
  return withSecurity(
    req,
    async (request) => {
      // Validate request body
      const validation = await validateRequestBody(request, formSchemas.contact);

      if (!validation.success) {
        return validation.error;
      }

      const { name, email, phone, message } = validation.data;

      // Sanitize user-generated content
      const sanitizedMessage = sanitizeUserContent(message);

      // TODO: Send email notification or save to database
      console.log('Contact form submission:', {
        name,
        email,
        phone,
        message: sanitizedMessage
      });

      // Simulate async operation (e.g., sending email)
      await new Promise(resolve => setTimeout(resolve, 200));

      return createApiResponse({
        success: true,
        message: 'Your message has been sent successfully. We will get back to you soon!'
      }, 201);
    },
    {
      allowedMethods: ['POST'],
      rateLimit: {
        enabled: true,
        type: 'email'
      },
      csrf: {
        enabled: true,
        useDoubleSubmit: true // Use double submit cookie pattern
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
      'Access-Control-Allow-Headers': 'Content-Type, X-CSRF-Token',
      'Access-Control-Max-Age': '86400'
    }
  });
}
