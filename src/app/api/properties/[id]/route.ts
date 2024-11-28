import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

// GET /api/properties/[id] - Get a single property
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id: params.id
      },
      include: {
        sharedWith: {
          include: {
            client: true
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
      { error: 'Error fetching property' },
      { status: 500 }
    );
  }
}

// PATCH /api/properties/[id] - Update a property
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();

    const property = await prisma.property.update({
      where: {
        id: params.id
      },
      data: {
        title: body.title,
        address: body.address,
        price: body.price,
        type: body.type,
        bedrooms: body.bedrooms,
        bathrooms: body.bathrooms,
        area: body.area,
        status: body.status,
        description: body.description,
        features: body.features,
        images: body.images
      }
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error updating property:', error);
    return NextResponse.json(
      { error: 'Error updating property' },
      { status: 500 }
    );
  }
}

// DELETE /api/properties/[id] - Delete a property
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await prisma.property.delete({
      where: {
        id: params.id
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting property:', error);
    return NextResponse.json(
      { error: 'Error deleting property' },
      { status: 500 }
    );
  }
} 