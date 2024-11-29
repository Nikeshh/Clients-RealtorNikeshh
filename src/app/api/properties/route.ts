import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/properties - Get all properties
export const GET = withAuth(async (req: NextRequest) => {
  try {
    const properties = await prisma.property.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
});

// POST /api/properties - Create a new property
export const POST = withAuth(async (req: NextRequest) => {
  try {
    const data = await req.json();
    
    // Create base property data
    const propertyData = {
      title: data.title,
      address: data.address,
      price: parseFloat(data.price),
      type: data.type,
      listingType: data.listingType,
      bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
      bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
      area: parseFloat(data.area),
      status: data.status || "Available",
      description: data.description,
      features: data.features || [],
      images: data.images || [],
      source: data.source,
      location: data.location,
      yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : null,
      link: data.link || null,
    };

    // Add rental specific fields if it's a rental
    if (data.listingType === 'RENTAL') {
      Object.assign(propertyData, {
        furnished: data.furnished || false,
        petsAllowed: data.petsAllowed || false,
        leaseTerm: data.leaseTerm || null,
      });
    }

    // Add purchase specific fields if it's a sale
    if (data.listingType === 'SALE') {
      Object.assign(propertyData, {
        lotSize: data.lotSize ? parseFloat(data.lotSize) : null,
        basement: data.basement || false,
        garage: data.garage || false,
        parkingSpaces: data.parkingSpaces ? parseInt(data.parkingSpaces) : null,
        propertyStyle: data.propertyStyle || null,
      });
    }

    const property = await prisma.property.create({
      data: propertyData
    });
    
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}); 