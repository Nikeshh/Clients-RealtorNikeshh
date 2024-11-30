import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { sendEmail } from '../../email/route';

interface SharedPropertyWithRelations {
  id: string;
  propertyId: string;
  stageId: string;
  status: string;
  sharedDate: Date;
  stage: {
    id: string;
    client: {
      id: string;
      name: string;
      email: string;
    }
  };
  property: {
    id: string;
    title: string;
  };
}

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { propertyId, stageIds } = await request.json();

    // Validate input
    if (!propertyId || !stageIds || !Array.isArray(stageIds)) {
      return NextResponse.json(
        { error: 'Property ID and Stage IDs array are required' },
        { status: 400 }
      );
    }

    // Get property details
    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return NextResponse.json(
        { error: 'Property not found' },
        { status: 404 }
      );
    }

    // Group shares by stage to send one email per client with all properties
    const stageShares = new Map<string, { stage: any; properties: any[] }>();

    // Create share records for each stage
    const shares = await Promise.all(
      stageIds.map(async (stageId) => {
        // Get stage with client info
        const stage = await prisma.stage.findUnique({
          where: { id: stageId },
          include: {
            client: true
          }
        });

        if (!stage) {
          throw new Error(`Stage with ID ${stageId} not found`);
        }

        // Check if already shared
        const existingShare = await prisma.sharedProperty.findFirst({
          where: {
            propertyId,
            stageId
          },
          include: {
            stage: {
              include: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            property: true
          }
        });

        if (existingShare) {
          // Add to stage's properties group
          if (!stageShares.has(stageId)) {
            stageShares.set(stageId, { stage, properties: [] });
          }
          stageShares.get(stageId)?.properties.push(property);
          return existingShare;
        }

        // Create new share record
        const newShare = await prisma.sharedProperty.create({
          data: {
            propertyId,
            stageId,
            status: 'Shared',
            sharedDate: new Date(),
          },
          include: {
            stage: {
              include: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            },
            property: true
          }
        });

        // Add to stage's properties group
        if (!stageShares.has(stageId)) {
          stageShares.set(stageId, { stage, properties: [] });
        }
        stageShares.get(stageId)?.properties.push(property);

        // Create interaction record with clientId
        await prisma.interaction.create({
          data: {
            clientId: stage.client.id,
            stageId,
            type: 'Property Shared',
            description: `Shared property: ${property.title}`,
            date: new Date(),
          }
        });

        return newShare;
      })
    );

    // Send one email per client with all their shared properties
    await Promise.all(
      Array.from(stageShares.values()).map(async ({ stage, properties }) => {
        if (stage.client.email) {
          await sendEmail(
            stage.client.email,
            stage.client.name,
            properties
          );
        }
      })
    );

    return NextResponse.json({
      success: true,
      shares
    });
  } catch (error) {
    console.error('Error sharing property:', error);
    return NextResponse.json(
      { error: 'Failed to share property' },
      { status: 500 }
    );
  }
});

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const stageId = searchParams.get('stageId');

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    const sharedProperties = await prisma.sharedProperty.findMany({
      where: {
        stageId,
      },
      include: {
        property: {
          select: {
            id: true,
            title: true,
            address: true,
            price: true,
            images: true,
            status: true,
            listingType: true,
          },
        },
      },
      orderBy: {
        sharedDate: 'desc',
      },
    });

    return NextResponse.json(sharedProperties);
  } catch (error) {
    console.error('Error fetching shared properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shared properties' },
      { status: 500 }
    );
  }
}); 