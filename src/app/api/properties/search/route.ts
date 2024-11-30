import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || undefined;
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999999');
    const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined;
    const bathrooms = searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined;

    const properties = await prisma.property.findMany({
      where: {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
        AND: [
          { type: type },
          { price: { gte: minPrice } },
          { price: { lte: maxPrice } },
          ...(bedrooms ? [{ bedrooms }] : []),
          ...(bathrooms ? [{ bathrooms }] : []),
        ],
        status: 'ACTIVE',
      },
      select: {
        id: true,
        title: true,
        address: true,
        price: true,
        images: true,
        type: true,
        bedrooms: true,
        bathrooms: true,
        status: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      { error: 'Failed to search properties' },
      { status: 500 }
    );
  }
}); 