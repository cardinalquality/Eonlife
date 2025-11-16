import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GDPR Data Export API
 * Allows users to export all their personal data in JSON format
 *
 * NOTE: This endpoint requires authentication. Implement your authentication
 * middleware before using in production.
 */
export async function POST(req: NextRequest) {
  try {
    // TODO: Implement authentication middleware
    // For now, we'll use a simple email-based lookup
    // In production, you should use proper session management
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        orders: {
          include: {
            orderItems: true,
          },
        },
        addresses: true,
        consents: true,
        newsletterAnalytics: true,
        chatbotConversations: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if account is deleted
    if (user.deleted) {
      return NextResponse.json(
        { error: 'This account has been deleted' },
        { status: 410 }
      );
    }

    // Format data for export
    const exportData = {
      export_date: new Date().toISOString(),
      user_rights: {
        notice: 'This is all the personal data we have about you. You have the right to request correction, deletion, or portability of this data.',
        contact: 'For questions or requests, contact privacy@reluma.com',
      },
      personal_information: {
        user_id: user.id,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        phone: user.phone,
        account_created: user.createdAt,
        account_updated: user.updatedAt,
        newsletter_subscribed: user.newsletterSubscribed,
      },
      orders: user.orders.map(order => ({
        order_id: order.id,
        status: order.status,
        total: order.total,
        created_at: order.createdAt,
        updated_at: order.updatedAt,
        items: order.orderItems.map(item => ({
          product_name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
      })),
      addresses: user.addresses.map(address => ({
        type: address.type,
        street: address.street,
        city: address.city,
        state: address.state,
        zip_code: address.zipCode,
        country: address.country,
      })),
      consent_history: user.consents.map(consent => ({
        type: consent.type,
        accepted: consent.accepted,
        date: consent.createdAt,
      })),
      newsletter_analytics: user.newsletterAnalytics.map(analytic => ({
        event: analytic.event,
        date: analytic.createdAt,
        metadata: analytic.metadata,
      })),
      chat_history: user.chatbotConversations.map(conversation => ({
        conversation_id: conversation.id,
        created_at: conversation.createdAt,
        updated_at: conversation.updatedAt,
        messages: JSON.parse(conversation.messages),
      })),
    };

    // Create a downloadable JSON file
    const jsonString = JSON.stringify(exportData, null, 2);

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="reluma-data-export-${user.id}-${Date.now()}.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export data' },
      { status: 500 }
    );
  }
}
