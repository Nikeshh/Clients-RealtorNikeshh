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
        name: data.name || "New Requirement",
        type: data.type,
        propertyType: data.propertyType,
        budgetMin: parseFloat(data.budgetMin),
        budgetMax: parseFloat(data.budgetMax),
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        preferredLocations: data.preferredLocations || [],
        additionalRequirements: data.additionalRequirements || null,
        status: "Active",
        ...(data.type === 'RENTAL' ? {
          rentalPreferences: {
            create: {
              leaseTerm: data.rentalPreferences.leaseTerm,
              furnished: data.rentalPreferences.furnished,
              petsAllowed: data.rentalPreferences.petsAllowed,
              maxRentalBudget: parseFloat(data.budgetMax),
              preferredMoveInDate: data.rentalPreferences.preferredMoveInDate 
                ? new Date(data.rentalPreferences.preferredMoveInDate) 
                : null,
            }
          }
        } : {
          purchasePreferences: {
            create: {
              propertyAge: data.purchasePreferences.propertyAge,
              preferredStyle: data.purchasePreferences.preferredStyle,
              parking: data.purchasePreferences.parking 
                ? parseInt(data.purchasePreferences.parking) 
                : null,
              lotSize: data.purchasePreferences.lotSize 
                ? parseFloat(data.purchasePreferences.lotSize) 
                : null,
              basement: data.purchasePreferences.basement,
              garage: data.purchasePreferences.garage,
            }
          }
        })
      },
      include: {
        rentalPreferences: true,
        purchasePreferences: true,
      }
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'Requirement Added',
        description: `Added new ${data.type.toLowerCase()} requirement: ${data.name}`,
        date: new Date(),
      },
    });

    // Return updated client with all requirements
    const updatedClient = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        requirements: {
          include: {
            rentalPreferences: true,
            purchasePreferences: true,
            gatheredProperties: {
              include: {
                property: true,
              }
            }
          }
        },
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
        rentalPreferences: true,
        purchasePreferences: true,
        gatheredProperties: {
          include: {
            property: true,
          }
        }
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