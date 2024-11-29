import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// PATCH /api/clients/requirements/[id] - Update a requirement
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const matches = request.url.match(/\/requirements\/([^\/]+)/);
    const requirementId = matches ? matches[1] : null;

    if (!requirementId) {
      return NextResponse.json(
        { error: 'Requirement ID is required' },
        { status: 400 }
      );
    }

    const data = await request.json();

    // Get the existing requirement
    const existingRequirement = await prisma.clientRequirement.findUnique({
      where: { id: requirementId },
      include: { 
        client: true,
        rentalPreferences: true,
        purchasePreferences: true,
      }
    });

    if (!existingRequirement) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    // Update the requirement with type-specific preferences
    const updatedRequirement = await prisma.clientRequirement.update({
      where: { id: requirementId },
      data: {
        name: data.name,
        type: data.type,
        propertyType: data.propertyType,
        budgetMin: parseFloat(data.budgetMin),
        budgetMax: parseFloat(data.budgetMax),
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
        preferredLocations: data.preferredLocations || [],
        additionalRequirements: data.additionalRequirements || null,
        ...(data.type === 'RENTAL' ? {
          rentalPreferences: {
            upsert: {
              create: {
                leaseTerm: data.rentalPreferences?.leaseTerm || 'Long-term',
                furnished: data.rentalPreferences?.furnished || false,
                petsAllowed: data.rentalPreferences?.petsAllowed || false,
                maxRentalBudget: parseFloat(data.budgetMax),
                preferredMoveInDate: data.rentalPreferences?.preferredMoveInDate 
                  ? new Date(data.rentalPreferences.preferredMoveInDate) 
                  : null,
              },
              update: {
                leaseTerm: data.rentalPreferences?.leaseTerm || 'Long-term',
                furnished: data.rentalPreferences?.furnished || false,
                petsAllowed: data.rentalPreferences?.petsAllowed || false,
                maxRentalBudget: parseFloat(data.budgetMax),
                preferredMoveInDate: data.rentalPreferences?.preferredMoveInDate 
                  ? new Date(data.rentalPreferences.preferredMoveInDate) 
                  : null,
              }
            }
          },
          purchasePreferences: {
            delete: existingRequirement.purchasePreferences ? true : undefined
          }
        } : {
          purchasePreferences: {
            upsert: {
              create: {
                propertyAge: data.purchasePreferences?.propertyAge || null,
                preferredStyle: data.purchasePreferences?.preferredStyle || null,
                parking: data.purchasePreferences?.parking 
                  ? parseInt(data.purchasePreferences.parking) 
                  : null,
                lotSize: data.purchasePreferences?.lotSize 
                  ? parseFloat(data.purchasePreferences.lotSize) 
                  : null,
                basement: data.purchasePreferences?.basement || false,
                garage: data.purchasePreferences?.garage || false,
              },
              update: {
                propertyAge: data.purchasePreferences?.propertyAge || null,
                preferredStyle: data.purchasePreferences?.preferredStyle || null,
                parking: data.purchasePreferences?.parking 
                  ? parseInt(data.purchasePreferences.parking) 
                  : null,
                lotSize: data.purchasePreferences?.lotSize 
                  ? parseFloat(data.purchasePreferences.lotSize) 
                  : null,
                basement: data.purchasePreferences?.basement || false,
                garage: data.purchasePreferences?.garage || false,
              }
            }
          },
          rentalPreferences: {
            delete: existingRequirement.rentalPreferences ? true : undefined
          }
        })
      },
      include: {
        client: true,
        rentalPreferences: true,
        purchasePreferences: true,
        gatheredProperties: {
          include: {
            property: true,
          }
        }
      },
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: existingRequirement.client.id,
        type: 'Requirement Updated',
        description: `Updated ${data.type.toLowerCase()} requirement: ${data.name}`,
        date: new Date(),
      },
    });

    return NextResponse.json(updatedRequirement);
  } catch (error) {
    console.error('Error updating requirement:', error);
    return NextResponse.json(
      { error: 'Failed to update requirement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

// GET /api/clients/requirements/[id] - Get a single requirement
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const matches = request.url.match(/\/requirements\/([^\/]+)/);
    const requirementId = matches ? matches[1] : null;

    if (!requirementId) {
      return NextResponse.json(
        { error: 'Requirement ID is required' },
        { status: 400 }
      );
    }

    const requirement = await prisma.clientRequirement.findUnique({
      where: { id: requirementId },
      include: {
        client: true,
        rentalPreferences: true,
        purchasePreferences: true,
        gatheredProperties: {
          include: {
            property: true,
          }
        },
        interactions: {
          orderBy: {
            date: 'desc',
          },
        },
        checklist: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(requirement);
  } catch (error) {
    console.error('Error fetching requirement:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requirement' },
      { status: 500 }
    );
  }
});

// DELETE handler
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const matches = request.url.match(/\/requirements\/([^\/]+)/);
    const requirementId = matches ? matches[1] : null;

    if (!requirementId) {
      return NextResponse.json(
        { error: 'Requirement ID is required' },
        { status: 400 }
      );
    }

    // Get the requirement first to get the client ID
    const requirement = await prisma.clientRequirement.findUnique({
      where: { id: requirementId },
      include: { client: true }
    });

    if (!requirement) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    // Delete the requirement
    await prisma.clientRequirement.delete({
      where: { id: requirementId }
    });

    // Create an interaction record for the deletion
    await prisma.interaction.create({
      data: {
        clientId: requirement.client.id,
        type: 'Requirement Deleted',
        description: `Deleted ${requirement.type.toLowerCase()} requirement: ${requirement.name}`,
        date: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting requirement:', error);
    return NextResponse.json(
      { error: 'Failed to delete requirement', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}); 