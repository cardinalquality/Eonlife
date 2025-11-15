/**
 * API Middleware Helpers
 * Combines security middleware for easy use in API routes
 */

import { rateLimitMiddleware } from './rate-limit';
import { csrfMiddleware, doubleSubmitCsrfMiddleware } from './csrf';
import { validateInput, formatValidationErrors } from './validation';
import { sanitizeInput } from './sanitization';
import { z } from 'zod';

/**
 * Security middleware configuration
 */
export interface SecurityMiddlewareConfig {
  rateLimit?: {
    enabled: boolean;
    type?: 'api' | 'auth' | 'signup' | 'passwordReset' | 'email' | 'upload' | 'strict';
  };
  csrf?: {
    enabled: boolean;
    useDoubleSubmit?: boolean;
  };
  cors?: {
    enabled: boolean;
    origin?: string | string[];
    methods?: string[];
  };
}

/**
 * Apply security middleware to a request
 */
export async function applySecurityMiddleware(
  req: Request,
  config: SecurityMiddlewareConfig = {},
  userId?: string
): Promise<Response | null> {
  // CORS check
  if (config.cors?.enabled) {
    const corsError = checkCors(req, config.cors);
    if (corsError) return corsError;
  }

  // Rate limiting
  if (config.rateLimit?.enabled) {
    const rateLimitError = await rateLimitMiddleware(
      req,
      config.rateLimit.type || 'api',
      userId
    );
    if (rateLimitError) return rateLimitError;
  }

  // CSRF protection
  if (config.csrf?.enabled) {
    const identifier = userId || req.headers.get('x-forwarded-for') || 'unknown';
    const csrfError = config.csrf.useDoubleSubmit
      ? await doubleSubmitCsrfMiddleware(req)
      : await csrfMiddleware(req, identifier);
    if (csrfError) return csrfError;
  }

  return null;
}

/**
 * CORS configuration check
 */
function checkCors(
  req: Request,
  config: { origin?: string | string[]; methods?: string[] }
): Response | null {
  const origin = req.headers.get('origin');
  const method = req.method;

  // Check origin
  if (config.origin) {
    const allowedOrigins = Array.isArray(config.origin) ? config.origin : [config.origin];

    if (origin && !allowedOrigins.includes(origin) && !allowedOrigins.includes('*')) {
      return new Response(
        JSON.stringify({ error: 'CORS origin not allowed' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }

  // Check method
  if (config.methods && !config.methods.includes(method)) {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': config.methods.join(', ')
        }
      }
    );
  }

  return null;
}

/**
 * Get CORS headers
 */
export function getCorsHeaders(
  origin?: string | string[],
  methods: string[] = ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
): HeadersInit {
  const allowedOrigin = Array.isArray(origin) ? origin[0] : (origin || '*');

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': methods.join(', '),
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Max-Age': '86400'
  };
}

/**
 * Validate and sanitize request body
 */
export async function validateRequestBody<T>(
  req: Request,
  schema: z.ZodSchema<T>
): Promise<
  | { success: true; data: T }
  | { success: false; error: Response }
> {
  try {
    // Parse JSON body
    const body = await req.json();

    // Validate
    const validation = validateInput(schema, body);

    if (!validation.success) {
      return {
        success: false,
        error: new Response(
          JSON.stringify({
            error: 'Validation failed',
            errors: formatValidationErrors(validation.errors)
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      };
    }

    return {
      success: true,
      data: validation.data
    };
  } catch (error) {
    return {
      success: false,
      error: new Response(
        JSON.stringify({
          error: 'Invalid request body',
          message: error instanceof Error ? error.message : 'Invalid JSON'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    };
  }
}

/**
 * Create a secure API response
 */
export function createApiResponse(
  data: any,
  status: number = 200,
  additionalHeaders?: HeadersInit
): Response {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    ...additionalHeaders
  };

  return new Response(JSON.stringify(data), { status, headers });
}

/**
 * Create an error response
 */
export function createErrorResponse(
  message: string,
  status: number = 500,
  details?: any
): Response {
  return createApiResponse(
    {
      error: message,
      ...(details && { details })
    },
    status
  );
}

/**
 * Method guard middleware
 */
export function requireMethod(req: Request, allowedMethods: string[]): Response | null {
  if (!allowedMethods.includes(req.method)) {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        allowed: allowedMethods
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': allowedMethods.join(', ')
        }
      }
    );
  }

  return null;
}

/**
 * Authentication guard (example - integrate with your auth system)
 */
export function requireAuth(req: Request): { authenticated: boolean; userId?: string } {
  // TODO: Integrate with your authentication system (NextAuth, JWT, etc.)
  const authHeader = req.headers.get('authorization');

  if (!authHeader) {
    return { authenticated: false };
  }

  // Example: Bearer token validation
  const token = authHeader.replace('Bearer ', '');

  // TODO: Validate token and extract user ID
  // For now, return example
  return {
    authenticated: !!token,
    userId: 'example-user-id'
  };
}

/**
 * Comprehensive API route wrapper
 */
export async function withSecurity<T>(
  req: Request,
  handler: (req: Request, userId?: string) => Promise<Response>,
  config: SecurityMiddlewareConfig & {
    requireAuth?: boolean;
    allowedMethods?: string[];
  } = {}
): Promise<Response> {
  try {
    // Method check
    if (config.allowedMethods) {
      const methodError = requireMethod(req, config.allowedMethods);
      if (methodError) return methodError;
    }

    // Authentication check
    let userId: string | undefined;
    if (config.requireAuth) {
      const auth = requireAuth(req);
      if (!auth.authenticated) {
        return createErrorResponse('Unauthorized', 401);
      }
      userId = auth.userId;
    }

    // Apply security middleware
    const securityError = await applySecurityMiddleware(req, config, userId);
    if (securityError) return securityError;

    // Execute handler
    return await handler(req, userId);
  } catch (error) {
    console.error('API route error:', error);
    return createErrorResponse(
      'Internal server error',
      500,
      process.env.NODE_ENV === 'development' ? error : undefined
    );
  }
}
