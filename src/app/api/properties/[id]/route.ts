import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/properties/[id] - Get a single property
export const GET = withAuth(async (request: NextRequest) => {
  try {
    // Extract ID using URL pattern matching
    const pathname = new URL(request.url).pathname;
    const matches = pathname.match(/\/api\/properties\/([^\/]+)/);
    const id = matches ? matches[1] : null;

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        sharedWith: {
          include: {
            stage: {
              include: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error fetching property:', error);
    return NextResponse.json(
      { error: 'Failed to fetch property' },
      { status: 500 }
    );
  }
});

// PATCH /api/properties/[id] - Update a property
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const pathname = new URL(request.url).pathname;
    const id = pathname.match(/\/api\/properties\/([^\/]+)/)?.[1];

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();

    const property = await prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        address: data.address,
        price: parseFloat(data.price),
        type: data.type,
        listingType: data.listingType,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        area: parseFloat(data.area),
        status: data.status,
        description: data.description,
        features: data.features || [],
        images: data.images || [],
        location: data.location,
        yearBuilt: data.yearBuilt ? parseInt(data.yearBuilt) : null,
        
        // Rental specific fields
        furnished: data.furnished || false,
        petsAllowed: data.petsAllowed || false,
        leaseTerm: data.leaseTerm || null,
        
        // Purchase specific fields
        lotSize: data.lotSize ? parseFloat(data.lotSize) : null,
        basement: data.basement || false,
        garage: data.garage || false,
        parkingSpaces: data.parkingSpaces ? parseInt(data.parkingSpaces) : null,
        propertyStyle: data.propertyStyle || null,
        
        // Optional link field
        ...(data.link ? { link: data.link } : {})
      }
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
});

// DELETE /api/properties/[id] - Delete a property
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const pathname = new URL(request.url).pathname;
    const id = pathname.match(/\/api\/properties\/([^\/]+)/)?.[1];

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    await prisma.property.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Failed to delete property' },
      { status: 500 }
    );
  }
}); 