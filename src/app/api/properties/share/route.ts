import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { sendEmail } from '../../email/route';

interface SharedPropertyWithRelations {
  id: string;
  propertyId: string;
  clientId: string;
  status: string;
  sharedDate: Date;
  client: {
    id: string;
    name: string;
    email: string;
  };
  property: {
    id: string;
    title: string;
    // Add other property fields you need
  };
}

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const { propertyId, clientIds } = await request.json();

    // Validate input
    if (!propertyId || !clientIds || !Array.isArray(clientIds)) {
      return NextResponse.json(
        { error: 'Property ID and Client IDs array are required' },
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

    // Group shares by client to send one email per client with all properties
    const clientShares = new Map<string, { client: any; properties: any[] }>();

    // Create share records for each client
    const shares: SharedPropertyWithRelations[] = await Promise.all(
      clientIds.map(async (clientId) => {
        // Check if client exists
        const client = await prisma.client.findUnique({
          where: { id: clientId }
        });

        if (!client) {
          throw new Error(`Client with ID ${clientId} not found`);
        }

        // Check if already shared
        const existingShare = await prisma.sharedProperty.findFirst({
          where: {
            propertyId,
            clientId: clientId
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            property: true
          }
        });

        if (existingShare) {
          // Add to client's properties group
          if (!clientShares.has(clientId)) {
            clientShares.set(clientId, { client, properties: [] });
          }
          clientShares.get(clientId)?.properties.push(property);
          return existingShare;
        }

        // Create new share record
        const newShare = await prisma.sharedProperty.create({
          data: {
            propertyId,
            clientId: clientId,
            status: 'Shared',
            sharedDate: new Date(),
          },
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true
              }
            },
            property: true
          }
        });

        // Add to client's properties group
        if (!clientShares.has(clientId)) {
          clientShares.set(clientId, { client, properties: [] });
        }
        clientShares.get(clientId)?.properties.push(property);

        return newShare;
      })
    );

    // Send one email per client with all their shared properties
    await Promise.all(
      Array.from(clientShares.values()).map(async ({ client, properties }) => {
        if (client.email) {
          await sendEmail(
            client.email,
            client.name,
            properties // Send all properties for this client in one email
          );
        }
      })
    );

    // Create interaction records
    await Promise.all(
      Array.from(clientShares.entries()).map(([clientId, { properties }]) =>
        prisma.interaction.create({
          data: {
            clientId,
            type: 'Property Shared',
            description: `Shared ${properties.length} properties: ${properties.map(p => p.title).join(', ')}`,
            date: new Date(),
          },
        })
      )
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
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const sharedProperties = await prisma.sharedProperty.findMany({
      where: {
        clientId: clientId,
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