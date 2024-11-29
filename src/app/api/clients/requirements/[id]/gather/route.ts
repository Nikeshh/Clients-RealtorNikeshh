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
  
      // Create gathered property records
      const gatheredProperties = await Promise.all(
        propertyIds.map(async (propertyId: string) => {
          // Get property details
          const property = await prisma.property.findUnique({
            where: { id: propertyId },
          });
  
          if (!property) {
            throw new Error(`Property ${propertyId} not found`);
          }
  
          // Create the gathered property record regardless of matching criteria
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
          requirementId: requirement.id,
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