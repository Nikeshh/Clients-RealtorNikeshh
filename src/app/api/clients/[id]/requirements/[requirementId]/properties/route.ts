import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const { title, address, price, bedrooms, bathrooms, area, link } = await request.json();

    // Create a gathered property
    const gatheredProperty = await prisma.gatheredProperty.create({
      data: {
        requirementId,
        title,
        address,
        price,
        bedrooms,
        bathrooms,
        area,
        link,
      },
    });

    // Create an interaction
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'PROPERTY_GATHERED',
        description: `Property "${title}" gathered for requirement`,
        requirementId,
      },
    });

    return NextResponse.json(gatheredProperty);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];

    const gatheredProperties = await prisma.gatheredProperty.findMany({
      where: { requirementId },
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

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/')[0];
    const { propertyId } = await request.json();

    await prisma.gatheredProperty.delete({
      where: {
        id: propertyId,
        requirementId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to remove gathered property' },
      { status: 500 }
    );
  }
}); 