import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// POST /api/clients/requirements/[id]/gather - Gather properties for a requirement
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/gather')[0];
    const { propertyIds, notes } = await request.json();

    // Get the requirement details
    const requirement = await prisma.clientRequirement.findUnique({
      where: { id: requirementId },
      include: { client: true },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    // Create gathered property records
    const gatheredProperties = await Promise.all(
      propertyIds.map((propertyId: string) =>
        prisma.gatheredProperty.create({
          data: {
            requirementId,
            propertyId,
            notes: notes?.[propertyId] || null,
            status: 'Pending',
          },
          include: {
            property: true,
          },
        })
      )
    );

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: requirement.client.id,
        type: 'Properties Gathered',
        description: `Gathered ${propertyIds.length} properties for requirement: ${requirement.name}`,
        date: new Date(),
      },
    });

    return NextResponse.json(gatheredProperties);
  } catch (error) {
    console.error('Error gathering properties:', error);
    return NextResponse.json(
      { error: 'Failed to gather properties' },
      { status: 500 }
    );
  }
});

// PATCH /api/clients/requirements/[id]/gather/[propertyId] - Update gathered property status
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const pathParts = request.url.split('/requirements/')[1].split('/gather/');
    const requirementId = pathParts[0];
    const propertyId = pathParts[1];
    const { status, notes } = await request.json();

    // Find the gathered property first
    const existingGatheredProperty = await prisma.gatheredProperty.findFirst({
      where: {
        requirementId,
        propertyId,
      },
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
          },
        },
      },
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: gatheredProperty.requirement.client.id,
        type: 'Property Status Updated',
        description: `Updated status to ${status} for property: ${gatheredProperty.property.title}`,
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