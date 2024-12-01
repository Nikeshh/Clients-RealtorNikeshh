import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/properties - Get all properties
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const type = searchParams.get('type');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');

    // Build the where clause based on filters
    const where: any = {
      status: 'Available',
    };

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { address: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    if (minPrice) {
      where.price = {
        ...where.price,
        gte: parseFloat(minPrice),
      };
    }

    if (maxPrice) {
      where.price = {
        ...where.price,
        lte: parseFloat(maxPrice),
      };
    }

    if (bedrooms) {
      where.bedrooms = parseInt(bedrooms);
    }

    if (bathrooms) {
      where.bathrooms = parseInt(bathrooms);
    }

    const properties = await prisma.property.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to 50 properties at a time
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
});

// POST /api/properties - Create a new property
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const data = await request.json();

    const property = await prisma.property.create({
      data: {
        title: data.title,
        address: data.address,
        price: data.price,
        type: data.type,
        listingType: data.listingType || 'SALE',
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        area: data.area,
        description: data.description,
        features: data.features || [],
        images: data.images || [],
        source: data.source,
        location: data.location,
        yearBuilt: data.yearBuilt,
        link: data.link,
        furnished: data.furnished,
        petsAllowed: data.petsAllowed,
        leaseTerm: data.leaseTerm,
        lotSize: data.lotSize,
        basement: data.basement,
        garage: data.garage,
        parkingSpaces: data.parkingSpaces,
        propertyStyle: data.propertyStyle,
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}); 