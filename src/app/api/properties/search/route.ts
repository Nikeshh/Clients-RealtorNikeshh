import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import type { Property } from '@prisma/client';

type SearchFilters = {
  type?: string;
  priceRange?: {
    min?: number;
    max?: number;
  };
  bedrooms?: number;
  bathrooms?: number;
  minArea?: number;
  status?: string;
  location?: string;
};

// GET /api/properties/search - Search properties with filters
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Build search filters
    const filters: SearchFilters = {};
    
    // Property type filter
    if (searchParams.has('type')) {
      filters.type = searchParams.get('type') as string;
    }

    // Price range filter
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      filters.priceRange = {
        ...(minPrice && { min: Number(minPrice) }),
        ...(maxPrice && { max: Number(maxPrice) })
      };
    }

    // Room filters
    const bedrooms = searchParams.get('bedrooms');
    if (bedrooms) {
      filters.bedrooms = Number(bedrooms);
    }

    const bathrooms = searchParams.get('bathrooms');
    if (bathrooms) {
      filters.bathrooms = Number(bathrooms);
    }

    // Area filter
    const minArea = searchParams.get('minArea');
    if (minArea) {
      filters.minArea = Number(minArea);
    }

    // Status filter
    if (searchParams.has('status')) {
      filters.status = searchParams.get('status') as string;
    }

    // Location filter
    if (searchParams.has('location')) {
      filters.location = searchParams.get('location') as string;
    }

    // Build Prisma where clause
    const where: any = {
      ...(filters.type && { type: filters.type }),
      ...(filters.priceRange && {
        price: {
          ...(filters.priceRange.min && { gte: filters.priceRange.min }),
          ...(filters.priceRange.max && { lte: filters.priceRange.max })
        }
      }),
      ...(filters.bedrooms && { bedrooms: filters.bedrooms }),
      ...(filters.bathrooms && { bathrooms: filters.bathrooms }),
      ...(filters.minArea && { area: { gte: filters.minArea } }),
      ...(filters.status && { status: filters.status }),
      ...(filters.location && {
        OR: [
          { address: { contains: filters.location, mode: 'insensitive' } },
          { location: { contains: filters.location, mode: 'insensitive' } }
        ]
      })
    };

    // Execute search query
    const properties = await prisma.property.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });

    return NextResponse.json({
      properties,
      filters,
      total: properties.length
    });
  } catch (error) {
    console.error('Error searching properties:', error);
    return NextResponse.json(
      { error: 'Error searching properties' },
      { status: 500 }
    );
  }
} 