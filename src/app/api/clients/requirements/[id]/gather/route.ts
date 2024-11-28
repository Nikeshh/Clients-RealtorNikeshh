import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

// POST /api/clients/requirements/[id]/gather - Gather properties for a requirement
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const requirementId = request.url.split('/requirements/')[1].split('/gather')[0];
    const { propertyIds, notes } = await request.json();

    // Get the requirement details with preferences
    const requirement = await prisma.clientRequirement.findUnique({
      where: { id: requirementId },
      include: { 
        client: true,
        rentalPreferences: true,
        purchasePreferences: true,
      },
    });

    if (!requirement) {
      return NextResponse.json(
        { error: 'Requirement not found' },
        { status: 404 }
      );
    }

    // Create gathered property records with type-specific validation
    const gatheredProperties = await Promise.all(
      propertyIds.map(async (propertyId: string) => {
        // Get property details to validate against requirements
        const property = await prisma.property.findUnique({
          where: { id: propertyId },
        });

        if (!property) {
          throw new Error(`Property ${propertyId} not found`);
        }

        // Validate property matches requirement type
        const matchesType = property.type.toLowerCase() === requirement.propertyType.toLowerCase();
        const matchesBudget = property.price >= requirement.budgetMin && property.price <= requirement.budgetMax;

        // Type-specific validation
        let typeSpecificMatch = true;
        if (requirement.type === 'RENTAL' && requirement.rentalPreferences) {
          // Add rental-specific validation here if needed
          typeSpecificMatch = true; // Placeholder for rental validation
        } else if (requirement.type === 'PURCHASE' && requirement.purchasePreferences) {
          // Add purchase-specific validation here if needed
          typeSpecificMatch = true; // Placeholder for purchase validation
        }

        if (!matchesType || !matchesBudget || !typeSpecificMatch) {
          throw new Error(`Property ${propertyId} does not match requirement criteria`);
        }

        return prisma.gatheredProperty.create({
          data: {
            requirementId,
            propertyId,
            notes: notes?.[propertyId] || null,
            status: 'Pending',
          },
          include: {
            property: true,
          },
        });
      })
    );

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: requirement.client.id,
        type: 'Properties Gathered',
        description: `Gathered ${propertyIds.length} properties for ${requirement.type.toLowerCase()} requirement: ${requirement.name}`,
        date: new Date(),
      },
    });

    return NextResponse.json(gatheredProperties);
  } catch (error) {
    console.error('Error gathering properties:', error);
    return NextResponse.json(
      { error: 'Failed to gather properties', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
});

// PATCH /api/clients/requirements/[id]/gather/[propertyId] - Update gathered property status
export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const pathParts = request.url.split('/requirements/')[1].split('/gather/');
    const requirementId = pathParts[0];
    const propertyId = pathParts[1];
    const { status, notes } = await request.json();

    // Find the gathered property first
    const existingGatheredProperty = await prisma.gatheredProperty.findFirst({
      where: {
        requirementId,
        propertyId,
      },
      include: {
        requirement: {
          include: {
            client: true,
          }
        }
      }
    });

    if (!existingGatheredProperty) {
      return NextResponse.json(
        { error: 'Gathered property not found' },
        { status: 404 }
      );
    }

    // Update the gathered property
    const gatheredProperty = await prisma.gatheredProperty.update({
      where: {
        id: existingGatheredProperty.id,
      },
      data: {
        status,
        notes,
      },
      include: {
        property: true,
        requirement: {
          include: {
            client: true,
            rentalPreferences: true,
            purchasePreferences: true,
          },
        },
      },
    });

    // Create an interaction record
    await prisma.interaction.create({
      data: {
        clientId: gatheredProperty.requirement.client.id,
        type: 'Property Status Updated',
        description: `Updated status to ${status} for ${gatheredProperty.requirement.type.toLowerCase()} property: ${gatheredProperty.property.title}`,
        date: new Date(),
      },
    });

    return NextResponse.json(gatheredProperty);
  } catch (error) {
    console.error('Error updating gathered property:', error);
    return NextResponse.json(
      { error: 'Failed to update gathered property' },
      { status: 500 }
    );
  }
}); 