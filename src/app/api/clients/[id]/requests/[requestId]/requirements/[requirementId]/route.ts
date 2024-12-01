import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const {
      name,
      type,
      propertyType,
      budgetMin,
      budgetMax,
      bedrooms,
      bathrooms,
      preferredLocations,
      additionalRequirements,
      status,
    } = await request.json();

    const requirement = await prisma.clientRequirement.update({
      where: { id: requirementId },
      data: {
        ...(name && { name }),
        ...(type && { type }),
        ...(propertyType && { propertyType }),
        ...(budgetMin && { budgetMin }),
        ...(budgetMax && { budgetMax }),
        ...(bedrooms && { bedrooms }),
        ...(bathrooms && { bathrooms }),
        ...(preferredLocations && { preferredLocations }),
        ...(additionalRequirements && { additionalRequirements }),
        ...(status && { status }),
      },
      include: {
        gatheredProperties: {
          include: {
            property: true,
          },
        },
        rentalPreferences: true,
        purchasePreferences: true,
      },
    });

    // Create an interaction for status change
    if (status) {
      await prisma.interaction.create({
        data: {
          clientId: request.url.split('/clients/')[1].split('/')[0],
          type: 'REQUIREMENT_STATUS_CHANGED',
          description: `Requirement "${requirement.name}" status changed to ${status}`,
          requestId: request.url.split('/requests/')[1].split('/')[0],
          requirementId,
        },
      });
    }

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
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];

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