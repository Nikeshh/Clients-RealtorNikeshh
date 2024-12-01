import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const {
      propertyAge,
      preferredStyle,
      parking,
      lotSize,
      basement,
      garage,
    } = await request.json();

    const preferences = await prisma.purchasePreferences.update({
      where: { requirementId },
      data: {
        ...(propertyAge && { propertyAge }),
        ...(preferredStyle && { preferredStyle }),
        ...(parking !== undefined && { parking }),
        ...(lotSize && { lotSize }),
        ...(basement !== undefined && { basement }),
        ...(garage !== undefined && { garage }),
      },
    });

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update purchase preferences' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];

    const preferences = await prisma.purchasePreferences.findUnique({
      where: { requirementId },
    });

    if (!preferences) {
      return NextResponse.json(
        { error: 'Purchase preferences not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchase preferences' },
      { status: 500 }
    );
  }
}); 