import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const { propertyId } = await request.json();

    // Create the gathered property
    const gatheredProperty = await prisma.gatheredProperty.create({
      data: {
        requirementId,
        propertyId,
        status: 'Pending',
      },
      include: {
        property: true,
      },
    });

    // Create an interaction for this gathering
    await prisma.interaction.create({
      data: {
        clientId: request.url.split('/clients/')[1].split('/')[0],
        type: 'PROPERTY_GATHERED',
        description: `Property "${gatheredProperty.property.title}" gathered for requirement`,
        requirementId,
      },
    });

    return NextResponse.json(gatheredProperty);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to gather property' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];

    const gatheredProperties = await prisma.gatheredProperty.findMany({
      where: { requirementId },
      include: {
        property: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(gatheredProperties);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gathered properties' },
      { status: 500 }
    );
  }
}); 