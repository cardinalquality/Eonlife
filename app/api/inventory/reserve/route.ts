import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/mock-db';
import { initializeDatabase } from '@/lib/db/seed';

// Initialize database
initializeDatabase();

interface ReserveInventoryItem {
  productId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, items } = body as {
      orderId: string;
      items: ReserveInventoryItem[];
    };

    if (!orderId || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Order ID and items array are required' },
        { status: 400 }
      );
    }

    // Use transaction to ensure atomic updates
    await db.$transaction(async (tx: typeof db) => {
      for (const item of items) {
        const product = await tx.products.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.inventoryQuantity < item.quantity) {
          throw new Error(
            `Insufficient inventory for product ${product.name}`
          );
        }

        await tx.products.update({
          where: { id: item.productId },
          data: {
            inventoryQuantity: product.inventoryQuantity - item.quantity,
          },
        });
      }
    });

    return NextResponse.json({ success: true, orderId });
  } catch (error) {
    console.error('Error reserving inventory:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to reserve inventory',
      },
      { status: 500 }
    );
  }
}
