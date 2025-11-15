import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/mock-db';
import { initializeDatabase } from '@/lib/db/seed';

// Initialize database
initializeDatabase();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, authorName, rating, title, content } = body;

    // Validate input
    if (!productId || !authorName || !rating || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Create review
    const review = await db.reviews.create({
      data: {
        productId,
        authorName,
        rating,
        title,
        content,
        verified: false, // In production, this would be based on purchase history
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const reviews = await db.reviews.findMany({
      where: { productId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}
