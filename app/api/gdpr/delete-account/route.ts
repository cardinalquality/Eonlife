import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GDPR Account Deletion API
 * Allows users to request deletion of their account and personal data
 *
 * NOTE: This endpoint requires authentication. Implement your authentication
 * middleware before using in production.
 *
 * This implementation uses data anonymization rather than hard deletion
 * to comply with legal and tax record-keeping requirements.
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Implement authentication middleware
    // For now, we'll use email + confirmation
    const body = await req.json();
    const { email, confirmation } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Require explicit confirmation
    if (confirmation !== 'DELETE MY ACCOUNT') {
      return NextResponse.json(
        {
          error: 'Invalid confirmation. Please type "DELETE MY ACCOUNT" to confirm.',
          required_confirmation: 'DELETE MY ACCOUNT',
        },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orders: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if account is already deleted
    if (user.deleted) {
      return NextResponse.json(
        { error: 'This account has already been deleted' },
        { status: 410 }
      );
    }

    // Check for pending orders
    const pendingOrders = user.orders.filter(order =>
      ['pending', 'processing', 'shipped'].includes(order.status)
    );

    if (pendingOrders.length > 0) {
      return NextResponse.json(
        {
          error: 'Cannot delete account with pending orders',
          pending_orders: pendingOrders.map(order => ({
            order_id: order.id,
            status: order.status,
            created_at: order.createdAt,
          })),
          message: 'Please wait for all orders to be completed or contact support to cancel pending orders.',
        },
        { status: 400 }
      );
    }

    // Anonymize user data (keeping order records for legal/tax purposes)
    // This is a "soft delete" approach that complies with GDPR while maintaining
    // necessary business records
    const deletedUser = await prisma.$transaction(async (tx) => {
      // Anonymize user data
      const updated = await tx.user.update({
        where: { id: user.id },
        data: {
          email: `deleted-${user.id}@reluma.com`,
          firstName: 'Deleted',
          lastName: 'User',
          phone: null,
          deleted: true,
          deletedAt: new Date(),
          newsletterSubscribed: false,
        },
      });

      // Anonymize addresses
      await tx.address.updateMany({
        where: { userId: user.id },
        data: {
          street: 'REDACTED',
          city: 'REDACTED',
          state: 'XX',
          zipCode: '00000',
        },
      });

      // Delete chat conversations (not needed for legal purposes)
      await tx.chatbotConversation.deleteMany({
        where: { userId: user.id },
      });

      // Keep order history but anonymized (required for tax/legal compliance)
      // Newsletter analytics and consents are also kept for compliance

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: 'Account successfully deleted',
      deletion_details: {
        deleted_at: deletedUser.deletedAt,
        user_id: deletedUser.id,
        data_retained: {
          orders: 'Order history anonymized and retained for 7 years (legal requirement)',
          analytics: 'Anonymized analytics data retained for business purposes',
          note: 'All personally identifiable information has been removed or anonymized',
        },
      },
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to check deletion eligibility
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orders: {
          where: {
            status: {
              in: ['pending', 'processing', 'shipped'],
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (user.deleted) {
      return NextResponse.json({
        eligible: false,
        reason: 'Account already deleted',
      });
    }

    const hasPendingOrders = user.orders.length > 0;

    return NextResponse.json({
      eligible: !hasPendingOrders,
      pending_orders: user.orders.length,
      message: hasPendingOrders
        ? 'You have pending orders. Please wait for completion or contact support.'
        : 'Your account is eligible for deletion.',
    });
  } catch (error) {
    console.error('Error checking deletion eligibility:', error);
    return NextResponse.json(
      { error: 'Failed to check eligibility' },
      { status: 500 }
    );
  }
}
