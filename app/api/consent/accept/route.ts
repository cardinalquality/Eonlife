import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, accepted } = body;

    if (!type || typeof accepted !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid request. Type and accepted fields are required.' },
        { status: 400 }
      );
    }

    // Get IP address and user agent for tracking
    const ipAddress = req.headers.get('x-forwarded-for') ||
                     req.headers.get('x-real-ip') ||
                     'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';

    // For now, we'll store consent without user ID (anonymous tracking)
    // When authentication is implemented, you can link this to a user
    const consent = await prisma.consent.create({
      data: {
        type,
        accepted,
        ipAddress,
        userAgent,
      },
    });

    return NextResponse.json({
      success: true,
      consent: {
        id: consent.id,
        type: consent.type,
        accepted: consent.accepted,
        createdAt: consent.createdAt,
      },
    });
  } catch (error) {
    console.error('Error saving consent:', error);
    return NextResponse.json(
      { error: 'Failed to save consent' },
      { status: 500 }
    );
  }
}
