import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// GET /api/clients/[id] - Get a single client
export const GET = withAuth(async (request: NextRequest) => {
  try {
    // Extract id from the URL
    const id = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const client = await prisma.client.findUnique({
      where: {
        id: id,
      },
      include: {
        requirements: true,
        interactions: {
          orderBy: {
            date: 'desc',
          },
        },
        sharedProperties: {
          include: {
            property: true,
          },
          orderBy: {
            sharedDate: 'desc',
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error fetching client:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
});

// PATCH /api/clients/[id] - Update a client
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/').pop();
    const data = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.client.update({
      where: {
        id: id,
      },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        status: data.status,
        requirements: {
          update: {
            propertyType: data.requirements?.propertyType,
            budgetMin: data.requirements?.budgetMin ? parseFloat(data.requirements.budgetMin) : undefined,
            budgetMax: data.requirements?.budgetMax ? parseFloat(data.requirements.budgetMax) : undefined,
            bedrooms: data.requirements?.bedrooms ? parseInt(data.requirements.bedrooms) : null,
            bathrooms: data.requirements?.bathrooms ? parseInt(data.requirements.bathrooms) : null,
            preferredLocations: data.requirements?.preferredLocations,
            additionalRequirements: data.requirements?.additionalRequirements,
          }
        }
      },
      include: {
        requirements: true,
      }
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
});

// DELETE /api/clients/[id] - Delete a client
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const id = request.url.split('/').pop();

    if (!id) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    await prisma.client.delete({
      where: {
        id: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}); 