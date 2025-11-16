import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/mock-db';
import { initializeDatabase } from '@/lib/db/seed';

// Initialize database
initializeDatabase();

interface CheckInventoryItem {
  productId: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items } = body as { items: CheckInventoryItem[] };

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    const results = await Promise.all(
      items.map(async (item) => {
        const product = await db.products.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          return {
            productId: item.productId,
            available: false,
            currentStock: 0,
            error: 'Product not found',
          };
        }

        return {
          productId: item.productId,
          available: product.inventoryQuantity >= item.quantity,
          currentStock: product.inventoryQuantity,
          requested: item.quantity,
        };
      })
    );

    const allAvailable = results.every((r) => r.available);

    return NextResponse.json({
      allAvailable,
      items: results,
    });
  } catch (error) {
    console.error('Error checking inventory:', error);
    return NextResponse.json(
      { error: 'Failed to check inventory' },
      { status: 500 }
    );
  }
}
