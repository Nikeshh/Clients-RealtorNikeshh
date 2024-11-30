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
    // Get the property ID from the URL
    const pathname = new URL(request.url).pathname;
    const id = pathname.match(/\/api\/properties\/([^\/]+)/)?.[1];

    if (!id) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      );
    }

    // Parse the request body
    const data = await request.json();

    // Validate the property exists
    const existingProperty = await prisma.property.findUnique({
      where: { id }
    });

    if (!existingProperty) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Update the property
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        // If only updating status, use that, otherwise use all provided fields
        ...(data.status ? { status: data.status } : data),
      }
    });

    return NextResponse.json(updatedProperty);
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