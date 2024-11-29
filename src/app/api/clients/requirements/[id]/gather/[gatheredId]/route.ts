import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// PATCH /api/clients/requirements/[id]/gather/[gatheredId] - Update gathered property status
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const pathParts = request.url.split('/requirements/')[1].split('/gather/');
    const requirementId = pathParts[0];
    const gatheredId = pathParts[1];
    const { status, notes } = await request.json();

    // Find the gathered property first
    const existingGatheredProperty = await prisma.gatheredProperty.findFirst({
      where: {
        requirementId,
        id: gatheredId,
      },
      include: {
        requirement: {
          include: {
            client: true,
          }
        }
      }
    });

    if (!existingGatheredProperty) {
      return NextResponse.json(
        { error: 'Gathered property not found' },
        { status: 404 }
      );
    }

    // Update the gathered property
    const gatheredProperty = await prisma.gatheredProperty.update({
      where: {
        id: existingGatheredProperty.id,
      },
      data: {
        status,
        notes,
      },
      include: {
        property: true,
        requirement: {
          include: {
            client: true,
            rentalPreferences: true,
            purchasePreferences: true,
          },
        },
      },
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: gatheredProperty.requirement.client.id,
        type: 'Property Status Updated',
        description: `Updated status to ${status} for ${gatheredProperty.requirement.type.toLowerCase()} property: ${gatheredProperty.property.title}`,
        date: new Date(),
      },
    });

    return NextResponse.json(gatheredProperty);
  } catch (error) {
    console.error('Error updating gathered property:', error);
    return NextResponse.json(
      { error: 'Failed to update gathered property' },
      { status: 500 }
    );
  }
});

// DELETE /api/clients/requirements/[id]/gather/[gatheredId] - Remove a gathered property
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const pathParts = request.url.split('/requirements/')[1].split('/gather/');
    const requirementId = pathParts[0];
    const gatheredId = pathParts[1];

    console.log('Deleting gathered property:', { requirementId, gatheredId });

    // Find the gathered property first
    const existingGatheredProperty = await prisma.gatheredProperty.findUnique({
      where: {
        id: gatheredId,
      },
      include: {
        requirement: {
          include: {
            client: true,
          }
        },
        property: true,
      }
    });

    if (!existingGatheredProperty) {
      console.log('Not found with:', { requirementId, gatheredId });
      return NextResponse.json(
        { error: 'Gathered property not found' },
        { status: 404 }
      );
    }

    console.log('Found gathered property:', existingGatheredProperty);

    // Delete the gathered property
    await prisma.gatheredProperty.delete({
      where: {
        id: gatheredId
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: existingGatheredProperty.requirement.client.id,
        requirementId,
        type: 'Property Removed',
        description: `Removed property: ${existingGatheredProperty.property.title}`,
        date: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing gathered property:', error);
    return NextResponse.json(
      { error: 'Failed to remove gathered property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}); 