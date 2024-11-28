import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// POST /api/clients/[id]/requirements - Add a new requirement
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/requirements')[0];
    const data = await request.json();

    const requirement = await prisma.clientRequirement.create({
      data: {
        clientId,
        name: data.name,
        propertyType: data.propertyType,
        budgetMin: parseFloat(data.budgetMin),
        budgetMax: parseFloat(data.budgetMax),
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        preferredLocations: data.preferredLocations,
        additionalRequirements: data.additionalRequirements,
      },
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'Requirement Added',
        description: `Added new requirement: ${data.name}`,
        date: new Date(),
      },
    });

    // Return updated client with all requirements
    const updatedClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        requirements: true,
        interactions: {
          orderBy: { date: 'desc' },
        },
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error creating requirement:', error);
    return NextResponse.json(
      { error: 'Failed to create requirement' },
      { status: 500 }
    );
  }
});

// GET /api/clients/[id]/requirements - Get all requirements for a client
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/requirements')[0];

    const requirements = await prisma.clientRequirement.findMany({
      where: { clientId },
      include: {
        gatheredProperties: {
          include: {
            property: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(requirements);
  } catch (error) {
    console.error('Error fetching requirements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirements' },
      { status: 500 }
    );
  }
}); 