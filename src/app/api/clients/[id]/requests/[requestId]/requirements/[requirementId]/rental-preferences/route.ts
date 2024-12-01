import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const {
      leaseTerm,
      furnished,
      petsAllowed,
      maxRentalBudget,
      preferredMoveInDate,
    } = await request.json();

    const preferences = await prisma.rentalPreferences.update({
      where: { requirementId },
      data: {
        ...(leaseTerm && { leaseTerm }),
        ...(furnished !== undefined && { furnished }),
        ...(petsAllowed !== undefined && { petsAllowed }),
        ...(maxRentalBudget && { maxRentalBudget }),
        ...(preferredMoveInDate && { preferredMoveInDate: new Date(preferredMoveInDate) }),
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update rental preferences' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];

    const preferences = await prisma.rentalPreferences.findUnique({
      where: { requirementId },
    });

    if (!preferences) {
      return NextResponse.json(
        { error: 'Rental preferences not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rental preferences' },
      { status: 500 }
    );
  }
}); 