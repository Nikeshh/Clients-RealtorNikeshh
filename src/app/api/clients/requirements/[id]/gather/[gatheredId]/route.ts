import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// PATCH /api/clients/requirements/[id]/gather/[gatheredId] - Update gathered property status
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const pathParts = request.url.split('/requirements/')[1].split('/gather/');
    const requirementId = pathParts[0];
    const gatheredId = pathParts[1];
    const { status } = await request.json();

    const updatedGatheredProperty = await prisma.gatheredProperty.update({
      where: {
        id: gatheredId,
      },
      data: {
        status,
      },
      include: {
        property: true,
        requirement: {
          include: {
            client: true,
          },
        },
      },
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: updatedGatheredProperty.requirement.client.id,
        requirementId: updatedGatheredProperty.requirementId,
        type: 'Property Status Update',
        description: `Updated status to ${status} for property: ${updatedGatheredProperty.property.title}`,
        date: new Date(),
      },
    });

    return NextResponse.json(updatedGatheredProperty);
  } catch (error) {
    console.error('Error updating gathered property:', error);
    return NextResponse.json(
      { error: 'Failed to update gathered property', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

// DELETE /api/clients/requirements/[id]/gather/[gatheredId] - Delete gathered property
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const pathParts = request.url.split('/requirements/')[1].split('/gather/');
    const requirementId = pathParts[0];
    const gatheredId = pathParts[1];

    // Find the gathered property first to get details for the interaction
    const gatheredProperty = await prisma.gatheredProperty.findUnique({
      where: {
        id: gatheredId,
      },
      include: {
        property: true,
        requirement: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!gatheredProperty) {
      return NextResponse.json(
        { error: 'Gathered property not found' },
        { status: 404 }
      );
    }

    // Delete the gathered property
    await prisma.gatheredProperty.delete({
      where: {
        id: gatheredId,
      },
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: gatheredProperty.requirement.client.id,
        requirementId: gatheredProperty.requirementId,
        type: 'Property Removed',
        description: `Removed property: ${gatheredProperty.property.title}`,
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