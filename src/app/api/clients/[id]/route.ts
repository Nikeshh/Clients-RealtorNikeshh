import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];

    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: {
        requests: {
          include: {
            processes: {
              include: {
                tasks: true,
              },
            },
            requirements: {
              include: {
                gatheredProperties: {
                  include: {
                    property: true,
                  },
                },
                rentalPreferences: true,
                purchasePreferences: true,
              },
            },
            checklist: true,
            interactions: true,
          },
        },
        checklist: true,
        interactions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch client' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const updates = await request.json();

    const client = await prisma.client.update({
      where: { id: clientId },
      data: updates,
      include: {
        requests: {
          include: {
            processes: {
              include: {
                tasks: true,
              },
            },
            requirements: {
              include: {
                gatheredProperties: {
                  include: {
                    property: true,
                  },
                },
                rentalPreferences: true,
                purchasePreferences: true,
              },
            },
            checklist: true,
            interactions: true,
          },
        },
        checklist: true,
        interactions: {
          orderBy: {
            date: 'desc',
          },
        },
      },
    });

    return NextResponse.json(client);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update client' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];

    await prisma.client.delete({
      where: { id: clientId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}); 