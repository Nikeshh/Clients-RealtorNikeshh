import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const requestId = request.url.split('/requests/')[1].split('/')[0];
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
    } = await request.json();

    const requirement = await prisma.clientRequirement.create({
      data: {
        requestId,
        name,
        type,
        propertyType,
        budgetMin,
        budgetMax,
        bedrooms,
        bathrooms,
        preferredLocations,
        additionalRequirements,
        status: 'Active',
      },
      include: {
        gatheredProperties: {
          include: {
            property: true,
          },
        },
      },
    });

    // Create an interaction for requirement creation
    await prisma.interaction.create({
      data: {
        clientId: request.url.split('/clients/')[1].split('/')[0],
        type: 'REQUIREMENT_CREATED',
        description: `New ${type} requirement "${name}" created`,
        requestId,
        requirementId: requirement.id,
      },
    });

    // If it's a rental requirement, create rental preferences
    if (type === 'RENTAL') {
      await prisma.rentalPreferences.create({
        data: {
          requirementId: requirement.id,
          leaseTerm: 'LONG_TERM',
          maxRentalBudget: budgetMax,
        },
      });
    }

    // If it's a purchase requirement, create purchase preferences
    if (type === 'PURCHASE') {
      await prisma.purchasePreferences.create({
        data: {
          requirementId: requirement.id,
        },
      });
    }

    return NextResponse.json(requirement);
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
        gatheredProperties: {
          include: {
            property: true,
          },
        },
        rentalPreferences: true,
        purchasePreferences: true,
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