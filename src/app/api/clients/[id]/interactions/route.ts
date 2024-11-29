import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/interactions')[0];
    const data = await request.json();

    // Create the interaction
    const interaction = await prisma.interaction.create({
      data: {
        clientId,
        type: data.type,
        description: data.description,
        notes: data.notes,
        date: new Date(),
      },
    });

    // Get updated client data
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
          orderBy: {
            date: 'desc',
          },
        },
        sharedProperties: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!updatedClient) {
      return NextResponse.json(
        { error: 'Client not found after update' },
        { status: 404 }
      );
    }

    // Update last contact date
    await prisma.client.update({
      where: { id: clientId },
      data: { lastContact: new Date() },
    });

    return NextResponse.json(updatedClient);
  } catch (error) {
    console.error('Error creating interaction:', error);
    return NextResponse.json(
      { error: 'Failed to create interaction', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}); 