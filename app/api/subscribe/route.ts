/**
 * Newsletter Subscription API Route
 * POST /api/subscribe
 *
 * Handles new newsletter signups by creating users in the database
 */

import { createUser, getUserByEmail } from '@/lib/db/users';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { email, name } = body;

    // Validate input
    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Parse name into first and last name
    const nameParts = name.trim().split(/\s+/);
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || firstName;

    // Check if user already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      // User exists - if already subscribed, return success; if not, subscribe them
      if (existingUser.newsletter_subscribed) {
        return NextResponse.json(
          {
            message: 'Already subscribed',
            userId: existingUser.user_id
          },
          { status: 200 }
        );
      }
    }

    // Create new user with newsletter subscription
    const user = await createUser({
      email,
      first_name: firstName,
      last_name: lastName,
      email_verified: false,
      newsletter_subscribed: true,
      newsletter_consent_date: new Date(),
      preferences: {
        frequency: 'weekly',
        topics: ['new_products', 'promotions', 'tips']
      }
    });

    // Return success response
    return NextResponse.json(
      {
        message: 'Successfully subscribed to newsletter',
        userId: user.user_id,
        email: user.email,
        firstName: user.first_name
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Newsletter subscription error:', error);

    // Check for specific error types
    if (error instanceof Error) {
      // Handle duplicate email error
      if (error.message.includes('duplicate') || error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'This email is already subscribed' },
          { status: 409 }
        );
      }

      // Handle database connection error
      if (error.message.includes('connection') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please try again later.' },
          { status: 503 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

/**
 * GET handler for health check
 */
export async function GET() {
  return NextResponse.json(
    { message: 'Newsletter subscription endpoint is ready' },
    { status: 200 }
  );
}
