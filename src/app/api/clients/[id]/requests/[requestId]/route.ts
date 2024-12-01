import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const requestId = request.url.split('/requests/')[1].split('/')[0];

    const clientRequest = await prisma.request.findUnique({
      where: { id: requestId },
      include: {
        processes: {
          include: {
            tasks: true,
          },
        },
        requirements: {
          include: {
            gatheredProperties: true,
            rentalPreferences: true,
            purchasePreferences: true,
            checklist: true,
          },
        },
        interactions: true,
      },
    });

    if (!clientRequest) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(clientRequest);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requestId = request.url.split('/requests/')[1].split('/')[0];
    const { status } = await request.json();

    const updatedRequest = await prisma.request.update({
      where: { id: requestId },
      data: { status },
      include: {
        processes: {
          include: {
            tasks: true,
          },
        },
        requirements: {
          include: {
            gatheredProperties: true,
            rentalPreferences: true,
            purchasePreferences: true,
            checklist: true,
          },
        },
        interactions: true,
      },
    });

    // Create an interaction for the status change
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'REQUEST_STATUS_CHANGED',
        description: `Request status changed to ${status}`,
        requestId,
      },
    });

    return NextResponse.json(updatedRequest);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const requestId = request.url.split('/requests/')[1].split('/')[0];

    // Create an interaction before deleting
    await prisma.interaction.create({
      data: {
        clientId,
        type: 'REQUEST_DELETED',
        description: 'Request deleted',
        requestId,
      },
    });

    // Delete the request (cascade will handle related records)
    await prisma.request.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete request' },
      { status: 500 }
    );
  }
}); 