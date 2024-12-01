import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import prisma from '@/lib/prisma';
import { getDefaultProcesses } from '@/utils/defaultProcesses';

export const GET = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];

    const requests = await prisma.request.findMany({
      where: { clientId },
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const { type } = await request.json();

    // Start a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create the request
      const clientRequest = await prisma.request.create({
        data: {
          clientId,
          type,
          status: 'ACTIVE',
        },
      });

      // Get default processes for this request type
      const defaultProcesses = getDefaultProcesses(type);

      // Create all processes and their tasks
      for (const processData of defaultProcesses) {
        const process = await prisma.process.create({
          data: {
            requestId: clientRequest.id,
            title: processData.title,
            description: processData.description,
            type: processData.type,
            status: 'PENDING',
          },
        });

        // Create tasks for this process
        if (processData.tasks) {
          for (const taskData of processData.tasks) {
            await prisma.processTask.create({
              data: {
                processId: process.id,
                type: taskData.type,
                status: 'PENDING',
              },
            });
          }
        }
      }

      // Create an interaction
      await prisma.interaction.create({
        data: {
          clientId,
          type: 'REQUEST_CREATED',
          description: `New ${type} request created`,
          requestId: clientRequest.id,
        },
      });

      // Return the request with all related data
      return prisma.request.findUnique({
        where: { id: clientRequest.id },
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
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    );
  }
});

export const PATCH = withAuth(async (request: NextRequest) => {
  try {
    const clientId = request.url.split('/clients/')[1].split('/')[0];
    const { requestId, status } = await request.json();

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
      { error: 'Failed to update request' },
      { status: 500 }
    );
  }
}); 