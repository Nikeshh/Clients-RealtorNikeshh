import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requestId = request.url.split('/requests/')[1].split('/')[0];
    const data = await request.json();

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the requirement
      const requirement = await prisma.clientRequirement.create({
        data: {
          requestId,
          name: data.name,
          type: data.type,
          propertyType: data.propertyType,
          budgetMin: data.budgetMin,
          budgetMax: data.budgetMax,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          preferredLocations: data.preferredLocations,
          additionalRequirements: data.additionalRequirements,
          status: 'Active',
        },
      });

      // Create an interaction
      await prisma.interaction.create({
        data: {
          clientId,
          type: 'REQUIREMENT_CREATED',
          description: `New requirement created: ${data.name}`,
          requestId,
          requirementId: requirement.id,
        },
      });

      // Return the requirement with all related data
      return prisma.clientRequirement.findUnique({
        where: { id: requirement.id },
        include: {
          gatheredProperties: true,
          rentalPreferences: true,
          purchasePreferences: true,
          checklist: true,
        },
      });
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create requirement' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requestId = request.url.split('/requests/')[1].split('/')[0];

    const requirements = await prisma.clientRequirement.findMany({
      where: { requestId },
      include: {
        gatheredProperties: true,
        rentalPreferences: true,
        purchasePreferences: true,
        checklist: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requestId = request.url.split('/requests/')[1].split('/')[0];
    const { requirementId, ...updates } = await request.json();

    const requirement = await prisma.clientRequirement.update({
      where: { id: requirementId },
      data: updates,
      include: {
        gatheredProperties: true,
        rentalPreferences: true,
        purchasePreferences: true,
        checklist: true,
      },
    });

    // Create an interaction for the update
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'REQUIREMENT_UPDATED',
        description: `Requirement "${requirement.name}" updated`,
        requestId,
        requirementId,
      },
    });

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update requirement' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requestId = request.url.split('/requests/')[1].split('/')[0];
    const { requirementId } = await request.json();

    // Create an interaction before deleting
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'REQUIREMENT_DELETED',
        description: 'Requirement deleted',
        requestId,
        requirementId,
      },
    });

    // Delete the requirement (cascade will handle related records)
    await prisma.clientRequirement.delete({
      where: { id: requirementId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete requirement' },
      { status: 500 }
    );
  }
}); 