import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';

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
            gatheredProperties: {
              include: {
                property: true,
              },
            },
            rentalPreferences: true,
            purchasePreferences: true,
            checklist: true,
          },
        },
      },
    });

    // Create an interaction for status change
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
      { error: 'Failed to update request status' },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const requestId = request.url.split('/requests/')[1].split('/')[0];

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